defmodule Athasha.Runner.Dataplot do
  alias Athasha.Bus
  alias Athasha.Ports
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Item
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

    config = %{
      item: Item.head(item),
      password: password,
      database: database,
      connstr: connstr,
      command: command
    }

    port = connect_port(config)
    true = Port.command(port, config.connstr)
    wait_ack(port, :connect)
    PubSub.Status.update!(item, :success, "Running")
    PubSub.Password.register!(item, password)
    Process.send_after(self(), :status, @status)
    Bus.register!({:dataplot, item.id})
    run_loop(item, config, port)
  end

  defp wait_ack(port, action) do
    receive do
      {^port, {:data, "ok"}} ->
        :ok

      {^port, {:data, <<"ex:", msg::binary>>}} ->
        Raise.error({action, msg})

      {^port, {:exit_status, status}} ->
        Raise.error({:receive, {:exit_status, status}})
    end
  end

  defp run_loop(item, config, port) do
    wait_once(item, config, port)
    run_loop(item, config, port)
  end

  defp wait_once(item = %{id: id}, config, port) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      {{:dataplot, ^id}, nil, {from, args}} ->
        args = Map.put(args, "command", config.command)
        true = Port.command(port, ["p", Jason.encode!(args)])
        wait_ack(port, :select)

        receive do
          {^port, {:data, data}} ->
            data = Jason.decode!(data)
            PubSub.Dataplot.response!(from, data)

          {^port, {:exit_status, status}} ->
            Raise.error({:receive, {:exit_status, status}})
        end

      other ->
        Raise.error({:receive, other})
    end
  end

  defp connect_port(config) do
    args = [config.database]
    Ports.open4("database", args)
  end
end
