defmodule Athasha.DataplotRunner do
  alias Athasha.Items
  alias Athasha.Ports
  alias Athasha.Raise
  @status 1000

  def run(item) do
    config = item.config
    setts = config["setts"]
    password = setts["password"]
    database = setts["database"]
    connstr = setts["connstr"]
    command = setts["command"]
    dbpass = setts["dbpass"]
    connstr = String.replace(connstr, "${PASSWORD}", dbpass)

    Items.register_password!(item, password)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      password: password,
      database: database,
      connstr: connstr,
      command: command
    }

    Items.update_status!(item, :warn, "Connecting...")
    port = connect_port(config)
    true = Port.command(port, config.connstr)
    Items.update_status!(item, :success, "Connected")
    Process.send_after(self(), :status, @status)
    run_loop(item, config, port)
  end

  defp run_loop(item, config, port) do
    wait_once(item, config, port)
    run_loop(item, config, port)
  end

  defp wait_once(item, _config, _port) do
    receive do
      :status ->
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp connect_port(config) do
    args = [config.database]
    Ports.open("database", args)
  end
end
