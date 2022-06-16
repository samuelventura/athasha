defmodule Athasha.Runner.Opto22 do
  alias Modbus.Master
  alias Athasha.Slave
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Item
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
        address = address(type, code, :i, module, number)

        %{
          id: "#{id} #{name}",
          name: name,
          getter: fn master -> getter(master, code, slave, address) end
        }
      end)

    outputs =
      Enum.map(config["outputs"], fn output ->
        code = output["code"]
        module = String.to_integer(output["module"])
        number = String.to_integer(output["number"])
        name = output["name"]
        address = address(type, code, :o, module, number)

        %{
          id: "#{id} #{name}",
          name: name,
          setter: fn master, value -> setter(master, code, slave, address, value) end
        }
      end)

    config = %{
      item: Item.head(item),
      type: type,
      slave: slave,
      host: host,
      port: port,
      period: period,
      inputs: inputs,
      outputs: outputs
    }

    case connect_master(config) do
      {:ok, master} ->
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
        names = Enum.map(outputs, & &1.name)
        PubSub.Output.reg_names!(id, names)
        Enum.each(outputs, fn output -> Bus.register!({:write, output.id}) end)
        PubSub.Password.register!(item, password)
        run_once(item, config, master, %{})
        PubSub.Status.update!(item, :success, "Connected")
        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, period)
        run_loop(item, config, master, %{}, period)

      {:error, reason} ->
        Raise.error({:connect, reason})
    end
  end

  defp run_loop(item, config, master, values, period) do
    values = wait_once(item, config, master, values, period)
    run_loop(item, config, master, values, period)
  end

  defp wait_once(item, config, master, values, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        values

      :once ->
        run_once(item, config, master, values)
        Process.send_after(self(), :once, period)
        %{}

      {{:write, id}, _, value} ->
        Map.put(values, id, value)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(%{id: id}, config, master, values) do
    Enum.each(config.inputs, fn input ->
      case input.getter.(master) do
        {:ok, value} ->
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          Raise.error({:input, reason, input.id})
      end
    end)

    Enum.each(config.outputs, fn output ->
      value = values[output.id]

      if value != nil do
        case output.setter.(master, value) do
          {:ok, value} ->
            PubSub.Output.update!(id, output.id, output.name, value)

          {:error, reason} ->
            Raise.error({:output, reason, output.id, value})
        end
      end
    end)
  end

  # 4ch Digital, pag 12
  # 4ch Analog, pag 13
  defp getter(master, "4ch Digital", slave, address), do: getter_bit(master, slave, address)
  defp getter(master, "4ch Analog", slave, address), do: getter_float(master, slave, address)
  defp getter(master, "4ch Latch On", slave, address), do: getter_bit(master, slave, address)
  defp getter(master, "4ch Latch Off", slave, address), do: getter_bit(master, slave, address)
  defp getter(master, "4ch Analog Min", slave, address), do: getter_float(master, slave, address)
  defp getter(master, "4ch Analog Max", slave, address), do: getter_float(master, slave, address)

  defp getter_bit(master, slave, address) do
    case Master.exec(master, {:ri, slave, address, 1}) do
      {:ok, [value]} -> {:ok, value}
      any -> any
    end
  end

  defp getter_float(master, slave, address) do
    case Master.exec(master, {:rir, slave, address, 2}) do
      {:ok, [w0, w1]} ->
        <<value::float-big-32>> = <<w0::16, w1::16>>
        {:ok, value}

      any ->
        any
    end
  end

  defp setter(master, "4ch Digital", slave, address, value),
    do: setter_bit(master, slave, address, value)

  defp setter(master, "4ch Analog", slave, address, value),
    do: setter_float(master, slave, address, value)

  defp setter(master, "4ch Latch On", slave, address, value),
    do: setter_bit(master, slave, address, value)

  defp setter(master, "4ch Latch Off", slave, address, value),
    do: setter_bit(master, slave, address, value)

  defp setter(master, "4ch Analog Min", slave, address, value),
    do: setter_bit(master, slave, address, value)

  defp setter(master, "4ch Analog Max", slave, address, value),
    do: setter_bit(master, slave, address, value)

  defp setter_bit(master, slave, address, value) do
    value = Number.to_bit(value)

    case Master.exec(master, {:fc, slave, address, value}) do
      :ok -> {:ok, value}
      any -> any
    end
  end

  defp setter_float(master, slave, address, value) do
    value = :erlang.float(value)
    <<w0::16, w1::16>> = <<value::float-big-32>>

    case Master.exec(master, {:phr, slave, address, [w0, w1]}) do
      :ok -> {:ok, value}
      any -> any
    end
  end

  defp ad(m, n), do: m * 4 + (n - 1)
  # defp aa(m, n), do: m * 8 + 2 * (n - 1)
  defp ad32(m, n), do: m * 32 + (n - 1)
  defp aa32(m, n), do: m * 4 * 32 + 2 * (n - 1)
  # https://documents.opto22.com/1678_Modbus_TCP_Protocol_Guide.pdf page 33
  defp address("SNAP-PAC-R1", "4ch Digital", _, m, n), do: ad(m, n)
  defp address("SNAP-PAC-EB1", "4ch Digital", _, m, n), do: ad(m, n)
  defp address("SNAP-PAC-R2", "4ch Digital", _, m, n), do: ad(m, n)
  defp address("SNAP-PAC-EB2", "4ch Digital", _, m, n), do: ad(m, n)

  defp address("SNAP-PAC-R1", "4ch Analog", _, m, n), do: 4609 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB1", "4ch Analog", _, m, n), do: 4609 - 1 + aa32(m, n)
  defp address("SNAP-PAC-R2", "4ch Analog", _, m, n), do: 4609 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB2", "4ch Analog", _, m, n), do: 4609 - 1 + aa32(m, n)

  defp address("SNAP-PAC-R1", "4ch Latch On", _, m, n), do: 129 - 1 + ad(m, n)
  defp address("SNAP-PAC-EB1", "4ch Latch On", _, m, n), do: 129 - 1 + ad(m, n)
  defp address("SNAP-PAC-R2", "4ch Latch On", _, m, n), do: 65 - 1 + ad(m, n)
  defp address("SNAP-PAC-EB2", "4ch Latch On", _, m, n), do: 65 - 1 + ad(m, n)

  defp address("SNAP-PAC-R1", "4ch Latch Off", _, m, n), do: 193 - 1 + ad(m, n)
  defp address("SNAP-PAC-EB1", "4ch Latch Off", _, m, n), do: 193 - 1 + ad(m, n)
  defp address("SNAP-PAC-R2", "4ch Latch Off", _, m, n), do: 129 - 1 + ad(m, n)
  defp address("SNAP-PAC-EB2", "4ch Latch Off", _, m, n), do: 129 - 1 + ad(m, n)

  defp address("SNAP-PAC-R1", "4ch Analog Min", :i, m, n), do: 6657 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB1", "4ch Analog Min", :i, m, n), do: 6657 - 1 + aa32(m, n)
  defp address("SNAP-PAC-R2", "4ch Analog Min", :i, m, n), do: 6657 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB2", "4ch Analog Min", :i, m, n), do: 6657 - 1 + aa32(m, n)

  defp address("SNAP-PAC-R1", "4ch Analog Max", :i, m, n), do: 8705 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB1", "4ch Analog Max", :i, m, n), do: 8705 - 1 + aa32(m, n)
  defp address("SNAP-PAC-R2", "4ch Analog Max", :i, m, n), do: 8705 - 1 + aa32(m, n)
  defp address("SNAP-PAC-EB2", "4ch Analog Max", :i, m, n), do: 8705 - 1 + aa32(m, n)

  defp address("SNAP-PAC-R1", "4ch Analog Min", :o, m, n), do: 3585 - 1 + ad32(m, n)
  defp address("SNAP-PAC-EB1", "4ch Analog Min", :o, m, n), do: 3585 - 1 + ad32(m, n)
  defp address("SNAP-PAC-R2", "4ch Analog Min", :o, m, n), do: 3585 - 1 + ad32(m, n)
  defp address("SNAP-PAC-EB2", "4ch Analog Min", :o, m, n), do: 3585 - 1 + ad32(m, n)

  defp address("SNAP-PAC-R1", "4ch Analog Max", :o, m, n), do: 4609 - 1 + ad32(m, n)
  defp address("SNAP-PAC-EB1", "4ch Analog Max", :o, m, n), do: 4609 - 1 + ad32(m, n)
  defp address("SNAP-PAC-R2", "4ch Analog Max", :o, m, n), do: 4609 - 1 + ad32(m, n)
  defp address("SNAP-PAC-EB2", "4ch Analog Max", :o, m, n), do: 4609 - 1 + ad32(m, n)

  defp connect_master(config) do
    trans = Modbus.Tcp.Transport
    proto = Modbus.Tcp.Protocol
    port = Slave.fix_port(config.port)

    case :inet.getaddr(String.to_charlist(config.host), :inet) do
      {:ok, ip} ->
        Master.start_link(trans: trans, proto: proto, ip: ip, port: port)

      any ->
        any
    end
  end
end
