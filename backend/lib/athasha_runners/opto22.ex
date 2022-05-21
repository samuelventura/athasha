defmodule Athasha.Runner.Opto22 do
  alias Modbus.Master
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Bus
  @status 1000

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    host = setts["host"]
    port = String.to_integer(setts["port"])
    period = String.to_integer(setts["period"])
    slave = String.to_integer(setts["slave"])
    type = setts["type"]
    password = setts["password"]

    inputs =
      Enum.map(config["inputs"], fn input ->
        code = input["code"]
        module = String.to_integer(input["module"])
        number = String.to_integer(input["number"])
        name = input["name"]
        decimals = Decimal.new(input["decimals"]) |> Decimal.to_integer()
        address = address(type, code, module, number)

        %{
          id: "#{id} #{name}",
          name: name,
          getter: fn master -> getter(master, code, slave, address) end,
          trimmer: Number.trimmer(decimals)
        }
      end)

    outputs =
      Enum.map(config["outputs"], fn output ->
        code = output["code"]
        module = String.to_integer(output["module"])
        number = String.to_integer(output["number"])
        name = output["name"]
        address = address(type, code, module, number)

        %{
          id: "#{id} #{name}",
          name: name,
          setter: fn master, value -> setter(master, code, slave, address, value) end
        }
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      type: type,
      slave: slave,
      host: host,
      port: port,
      period: period,
      inputs: inputs,
      outputs: outputs
    }

    PubSub.Status.update!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        PubSub.Status.update!(item, :success, "Connected")

        # avoid registering duplicates
        Enum.reduce(inputs, %{}, fn input, map ->
          iid = input.id

          if !Map.has_key?(map, iid) do
            PubSub.Input.register!(id, iid, input.name)
          end

          Map.put(map, iid, iid)
        end)

        # avoid registering duplicates
        Enum.reduce(outputs, %{}, fn output, map ->
          oid = output.id

          if !Map.has_key?(map, oid) do
            PubSub.Output.register!(id, oid, output.name)
          end

          Map.put(map, oid, oid)
        end)

        names = Enum.map(inputs, & &1.name)
        PubSub.Input.reg_names!(id, names)
        PubSub.Password.register!(item, password)
        names = Enum.map(outputs, & &1.name)
        PubSub.Output.reg_names!(id, names)
        Enum.each(outputs, fn output -> Bus.register!({:output, output.id}) end)

        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, 0)
        run_loop(item, config, master, %{})

      {:error, reason} ->
        PubSub.Status.update!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_master, config, reason})
    end
  end

  defp run_loop(item, config, master, values) do
    values = wait_once(item, config, master, values)
    run_loop(item, config, master, values)
  end

  defp wait_once(item, config, master, values) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        values

      :once ->
        run_once(item, config, master, values)
        Process.send_after(self(), :once, config.period)
        %{}

      {{:output, id}, _, value} ->
        Map.put(values, id, value)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item = %{id: id}, config, master, values) do
    Enum.each(config.inputs, fn input ->
      case input.getter.(master) do
        {:ok, value} ->
          value = input.trimmer.(value)
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          PubSub.Input.update!(id, input.id, input.name, nil)
          PubSub.Status.update!(item, :error, "#{inspect(input)} #{inspect(reason)}")
          Raise.error({:exec_input, input, reason})
      end
    end)

    Enum.each(config.outputs, fn output ->
      value = values[output.id]

      if value != nil do
        case output.setter.(master, value) do
          :ok ->
            PubSub.Output.update!(id, output.id, output.name, value)

          {:error, reason} ->
            PubSub.Output.update!(id, output.id, output.name, nil)
            PubSub.Status.update!(item, :error, "#{inspect(output)} #{inspect(reason)}")
            Raise.error({:exec_output, output, reason})
        end
      end
    end)
  end

  # 4ch Digital, pag 12
  # 4ch Analog, pag 13
  defp getter(master, "4chd", slave, address) do
    case Master.exec(master, {:ri, slave, address, 1}) do
      {:ok, [value]} -> {:ok, value}
      any -> any
    end
  end

  defp getter(master, "4cha", slave, address) do
    case Master.exec(master, {:rir, slave, address, 2}) do
      {:ok, [w0, w1]} ->
        <<value::float-big-32>> = <<w0::16, w1::16>>
        {:ok, value}

      any ->
        any
    end
  end

  defp setter(master, "4chd", slave, address, value) do
    Master.exec(master, {:fc, slave, address, value})
  end

  defp setter(master, "4cha", slave, address, value) do
    value = Number.to_float(value)
    <<w0::16, w1::16>> = <<value::float-big-32>>
    Master.exec(master, {:phr, slave, address, [w0, w1]})
  end

  defp address("Snap", "4chd", module, number), do: module * 4 + (number - 1)
  defp address("Snap", "4cha", module, number), do: module * 8 + 2 * (number - 1)

  defp connect_master(config) do
    trans = Modbus.Tcp.Transport
    proto = Modbus.Tcp.Protocol

    case :inet.getaddr(String.to_charlist(config.host), :inet) do
      {:ok, ip} ->
        Master.start_link(trans: trans, proto: proto, ip: ip, port: config.port)

      any ->
        any
    end
  end
end
