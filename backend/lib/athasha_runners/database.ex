defmodule Athasha.Database.Runner do
  alias Athasha.Items
  alias Athasha.Raise
  alias Athasha.Points
  @status 1000

  def run(item) do
    config = Jason.decode!(item.config)
    setts = config["setts"]
    host = setts["host"]
    period = setts["period"]
    {period, _} = Integer.parse(period)
    unit = setts["unit"]
    port = setts["port"]
    {port, _} = Integer.parse(port)
    database = setts["database"]
    username = setts["username"]
    password = setts["password"]
    command = setts["command"]

    period =
      case unit do
        "s" -> period * 1000
        "ms" -> period * 1
      end

    points =
      Enum.with_index(config["points"])
      |> Enum.map(fn {point, index} ->
        %{index: index, id: point["id"], param: "@#{index + 1}"}
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      host: host,
      port: port,
      period: period,
      points: points,
      database: database,
      username: username,
      password: password,
      command: command
    }

    Items.update_status!(item, :warn, "Connecting...")

    case connect_dbconn(config) do
      {:ok, dbconn} ->
        Items.update_status!(item, :success, "Connected")
        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, 0)
        run_loop(item, config, dbconn)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_dbconn, config, reason})
    end
  end

  defp run_loop(item, config, dbconn) do
    wait_once(item, config, dbconn)
    run_loop(item, config, dbconn)
  end

  defp wait_once(item, config, dbconn) do
    receive do
      :status ->
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, dbconn)
        Process.send_after(self(), :once, config.period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item, config, dbconn) do
    params =
      Enum.map(config.points, fn point ->
        id = point.id
        value = Points.get_value(id)

        if value == nil do
          Raise.error({:missing, id})
        end

        %Tds.Parameter{name: point.param, value: value}
      end)

    case Tds.query(dbconn, config.command, params) do
      {:ok, _res} ->
        :ok

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(params)} #{inspect(reason)}")
        Raise.error({:tds_query, params, reason})
    end
  end

  defp connect_dbconn(config) do
    Tds.start_link(
      hostname: config.host,
      username: config.username,
      password: config.password,
      database: config.database,
      port: config.port
    )
  end
end
