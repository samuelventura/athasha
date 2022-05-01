defmodule Athasha.DataplotRunner do
  alias Athasha.Items
  alias Athasha.Raise
  @status 1000

  def run(item) do
    config = item.config
    setts = config["setts"]
    host = setts["host"]
    port = parse_int(setts["port"])
    database = setts["database"]
    username = setts["username"]
    password = setts["password"]
    command = setts["command"]

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      host: host,
      port: port,
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
        Process.send_after(self(), :once, 1000)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(_item, _config, _dbconn) do
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

  defp parse_int(value) do
    {parsed, _} = Integer.parse(value)
    parsed
  end
end
