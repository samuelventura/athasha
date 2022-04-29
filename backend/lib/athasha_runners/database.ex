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
    period = max(period, 1)
    port = setts["port"]
    {port, _} = Integer.parse(port)
    database = setts["database"]
    username = setts["username"]
    password = setts["password"]
    command = setts["command"]

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
        run_loop(item, config, dbconn)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_dbconn, config, reason})
    end
  end

  # minimum period of 1s makes it ok to notify status on each cycle
  defp run_loop(item, config, dbconn) do
    throttled_status(item)
    run_once(item, config, dbconn)
    :timer.sleep(config.period * 1000)
    run_loop(item, config, dbconn)
  end

  defp throttled_status(item) do
    receive do
      :status ->
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      other ->
        Raise.error({:receive, other})
    after
      0 -> nil
    end
  end

  defp run_once(item, config, dbconn) do
    params =
      Enum.map(config.points, fn point ->
        value = Points.get_value(point.id)
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
