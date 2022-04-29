defmodule Athasha.Database.Runner do
  alias Athasha.Items
  alias Athasha.Raise
  alias Athasha.Points

  def run(item) do
    config = Jason.decode!(item.config)
    setts = config["setts"]
    host = setts["host"]
    period = setts["period"]
    {period, _} = Integer.parse(period)
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
        run_loop(item, config, dbconn)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
        Raise.error({"Database connection error", config, reason})
    end
  end

  defp run_loop(item, config, dbconn) do
    run_once(item, config, dbconn)
    Raise.on_message()
    :timer.sleep(config.period * 1000)
    run_loop(item, config, dbconn)
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
        Raise.error({"Database command error", params, reason})
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
