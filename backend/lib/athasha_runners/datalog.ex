defmodule Athasha.Runner.Datalog do
  alias Athasha.Raise
  alias Athasha.Ports
  alias Athasha.Number
  alias Athasha.PubSub
  alias Athasha.Item
  @status 1000

  def run(item) do
    config = item.config
    setts = config["setts"]
    unit = setts["unit"]
    period = String.to_integer(setts["period"])
    database = setts["database"]
    connstr = setts["connstr"]
    command = setts["command"]
    dbpass = setts["dbpass"]
    connstr = String.replace(connstr, "${PASSWORD}", dbpass)

    period =
      case unit do
        "s" -> period * 1000
        "m" -> period * 1000 * 60
      end

    inputs =
      Enum.with_index(config["inputs"])
      |> Enum.map(fn {input, index} ->
        %{index: index, id: input["id"], param: "@#{index + 1}"}
      end)

    config = %{
      item: Item.head(item),
      period: period,
      inputs: inputs,
      database: database,
      connstr: connstr,
      command: command
    }

    port = connect_port(config)
    true = Port.command(port, config.connstr)
    wait_ack(port, :connect)
    run_once(item, config, port)
    PubSub.Status.update!(item, :success, "Running")
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, period)
    run_loop(item, config, port, period)
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

  defp run_loop(item, config, port, period) do
    wait_once(item, config, port, period)
    run_loop(item, config, port, period)
  end

  defp wait_once(item, config, port, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, port)
        Process.send_after(self(), :once, period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(_item, config, port) do
    parameters =
      Enum.map(config.inputs, fn input ->
        id = input.id
        value = PubSub.Input.get_value(id)

        if value == nil do
          Raise.error({:missing, id})
        end

        %{value: value, type: Number.type_of(value)}
      end)

    dto = %{command: config.command, parameters: parameters}
    true = Port.command(port, ["l", Jason.encode!(dto)])
    wait_ack(port, :insert)
  end

  defp connect_port(config) do
    args = [config.database]
    Ports.open4("database", args)
  end
end
