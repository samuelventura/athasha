defmodule Athasha.Runner.Datafetch do
  alias Athasha.Ports
  alias Athasha.Raise
  alias Athasha.PubSub
  @status 1000

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    unit = setts["unit"]
    period = String.to_integer(setts["period"])
    password = setts["password"]
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
      Enum.map(config["inputs"], fn input ->
        name = input["name"]

        %{
          id: "#{id} #{name}",
          name: name
        }
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      period: period,
      password: password,
      database: database,
      connstr: connstr,
      command: command,
      inputs: inputs,
      count: length(inputs)
    }

    PubSub.Status.update!(item, :warn, "Connecting...")
    port = connect_port(config)
    true = Port.command(port, config.connstr)
    wait_ack(port, :connect)
    PubSub.Status.update!(item, :success, "Connected")

    # avoid registering duplicates
    Enum.reduce(inputs, %{}, fn input, map ->
      iid = input.id

      if !Map.has_key?(map, iid) do
        PubSub.Input.register!(id, iid, input.name)
      end

      Map.put(map, iid, iid)
    end)

    names = Enum.map(inputs, & &1.name)
    PubSub.Input.reg_names!(id, names)
    PubSub.Output.reg_names!(id, [])
    PubSub.Password.register!(item, password)
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, 0)
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

  defp wait_once(item, config, port) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, port)
        Process.send_after(self(), :once, config.period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item, config, port) do
    args = Map.put(%{}, "command", config.command)
    true = Port.command(port, ["f", Jason.encode!(args)])
    wait_ack(port, :select)

    receive do
      {^port, {:data, data}} ->
        case Jason.decode!(data) do
          [] ->
            update_inputs(item, config, [])
            Raise.error({:empty, data})

          [row] ->
            rl = length(row)
            il = config.count

            case rl == il do
              false ->
                update_inputs(item, config, [])
                Raise.error({:mismatch, il, rl, row})

              true ->
                update_inputs(item, config, row)
            end
        end

      {^port, {:exit_status, status}} ->
        Raise.error({:receive, {:exit_status, status}})
    end
  end

  defp update_inputs(item, config, []) do
    row = for _ <- 1..config.count, do: nil
    update_inputs(item, config, row)
  end

  defp update_inputs(item, config, row) do
    id = item.id

    Enum.zip(config.inputs, row)
    |> Enum.each(fn {input, value} ->
      PubSub.Input.update!(id, input.id, input.name, value)
    end)
  end

  defp connect_port(config) do
    args = [config.database]
    Ports.open4("database", args)
  end
end
