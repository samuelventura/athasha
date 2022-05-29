defmodule Athasha.Runner.Laurel do
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
    trans = setts["trans"]
    proto = setts["proto"]
    host = setts["host"]
    tty = setts["tty"]
    dbpsb = setts["dbpsb"]
    port = String.to_integer(setts["port"])
    speed = String.to_integer(setts["speed"])
    period = String.to_integer(setts["period"])
    password = setts["password"]

    slaves =
      Enum.map(config["slaves"], fn slave ->
        address = String.to_integer(slave["address"])
        decimals = String.to_integer(slave["decimals"])

        inputs =
          Enum.map(slave["inputs"], fn input ->
            code = input["code"]
            name = input["name"]

            %{
              id: "#{id} #{name}",
              name: name,
              getter: getter(code, decimals)
            }
          end)

        outputs =
          Enum.map(slave["outputs"], fn output ->
            code = output["code"]
            name = output["name"]

            %{
              id: "#{id} #{name}",
              name: name,
              setter: setter(code, address)
            }
          end)

        # meters read for these codes timeout
        # only read them for counters
        counter =
          Enum.count(slave["inputs"], fn input ->
            code = input["code"]

            case code do
              "Item 2" -> true
              "Item 3" -> true
              _ -> false
            end
          end)

        length =
          case counter do
            0 -> 8
            _ -> 12
          end

        slave = %{address: address, length: length}

        {slave, inputs, outputs}
      end)

    config = %{
      item: Item.head(item),
      trans: trans,
      proto: proto,
      host: host,
      port: port,
      tty: tty,
      speed: speed,
      dbpsb: dbpsb,
      period: period,
      slaves: slaves
    }

    case connect_master(config) do
      {:ok, master} ->
        # invalid response for commands sent to close to the connection
        # after reconnection from a sudden connection loss
        # 10ms works solidly, 1ms works 50% of the time
        :timer.sleep(100)
        # avoid registering duplicates
        Enum.reduce(slaves, %{}, fn {_, inputs, outputs}, map ->
          Enum.reduce(inputs, map, fn input, map ->
            iid = input.id

            if !Map.has_key?(map, iid) do
              PubSub.Input.register!(id, iid, input.name)
            end

            Map.put(map, iid, input)
          end)

          Enum.reduce(outputs, map, fn output, map ->
            oid = output.id

            if !Map.has_key?(map, oid) do
              PubSub.Output.register!(id, oid, output.name)
            end

            Map.put(map, oid, output)
          end)
        end)

        {inputs, outputs} =
          Enum.reduce(slaves, {[], []}, fn {_, inputs, outputs}, {ilist, olist} ->
            ilist =
              Enum.reduce(inputs, ilist, fn input, list ->
                [input | list]
              end)

            olist =
              Enum.reduce(outputs, olist, fn output, list ->
                [output | list]
              end)

            {ilist, olist}
          end)

        inputs = Enum.reverse(inputs)
        outputs = Enum.reverse(outputs)

        names = Enum.map(inputs, & &1.name)
        PubSub.Input.reg_names!(id, names)
        names = Enum.map(outputs, & &1.name)
        PubSub.Output.reg_names!(id, names)
        Enum.each(outputs, fn output -> Bus.register!({:write, output.id}) end)
        run_once(item, config, master, %{})
        PubSub.Status.update!(item, :success, "Connected")
        PubSub.Password.register!(item, password)
        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, period)
        run_loop(item, config, master, %{}, period)

      {:error, reason} ->
        PubSub.Status.update!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_master, config, reason})
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

  defp run_once(item = %{id: id}, config, master, values) do
    Enum.each(config.slaves, fn {slave, inputs, outputs} ->
      case Master.exec(master, {:rir, slave.address, 1, slave.length}) do
        {:ok, data} ->
          data =
            Enum.with_index(data)
            |> Enum.map(fn {v, i} -> {i, v} end)
            |> Enum.into(%{})

          Enum.each(inputs, fn input ->
            value = input.getter.(data)
            PubSub.Input.update!(id, input.id, input.name, value)
          end)

        {:error, reason} ->
          PubSub.Status.update!(item, :error, "#{inspect(slave)} #{inspect(reason)}")
          Raise.error({:exec_input, slave, reason})
      end

      Enum.each(outputs, fn output ->
        value = values[output.id]

        if value != nil do
          case output.setter.(master, value) do
            {:ok, value} ->
              PubSub.Output.update!(id, output.id, output.name, value)

            {:error, reason} ->
              PubSub.Status.update!(item, :error, "#{inspect(output)} #{inspect(reason)}")
              Raise.error({:exec_output, output, value, reason})
          end
        end
      end)
    end)
  end

  defp getter(code, decimals) do
    case code do
      "Item 1" -> fn data -> read_decimal(data, 3, decimals) end
      "Item 2" -> fn data -> read_decimal(data, 9, decimals) end
      "Item 3" -> fn data -> read_decimal(data, 11, decimals) end
      "Peak" -> fn data -> read_decimal(data, 5, decimals) end
      "Valley" -> fn data -> read_decimal(data, 7, decimals) end
      "Alarm 1" -> fn data -> read_alarm(data, 1) end
      "Alarm 2" -> fn data -> read_alarm(data, 2) end
      "Alarm 3" -> fn data -> read_alarm(data, 3) end
      "Alarm 4" -> fn data -> read_alarm(data, 4) end
    end
  end

  defp setter(code, slave) do
    case code do
      "Device Reset" -> fn master, value -> write_bool(master, slave, 1, value) end
      "Function Reset" -> fn master, value -> write_bool(master, slave, 2, value) end
      "Latched Alarm Reset" -> fn master, value -> write_bool(master, slave, 3, value) end
      "Peak Reset" -> fn master, value -> write_bool(master, slave, 4, value) end
      "Valley Reset" -> fn master, value -> write_bool(master, slave, 5, value) end
      "Remote Display Reset" -> fn master, value -> write_bool(master, slave, 6, value) end
      "Display Item 1" -> fn master, value -> write_bool(master, slave, 7, value) end
      "Display Item 2" -> fn master, value -> write_bool(master, slave, 8, value) end
      "Display Item 3" -> fn master, value -> write_bool(master, slave, 9, value) end
      "Display Peak" -> fn master, value -> write_bool(master, slave, 10, value) end
      "Display Valley" -> fn master, value -> write_bool(master, slave, 11, value) end
      "Tare" -> fn master, value -> write_bool(master, slave, 12, value) end
      "Meter Hold" -> fn master, value -> write_bool(master, slave, 13, value) end
      "Blank Display" -> fn master, value -> write_bool(master, slave, 14, value) end
      "Activate External Input A" -> fn master, value -> write_bool(master, slave, 15, value) end
      "Activate External Input B" -> fn master, value -> write_bool(master, slave, 16, value) end
    end
  end

  defp write_bool(master, slave, address, value) do
    value = Number.to_bit(value)

    case Master.exec(master, {:fc, slave, address, value}) do
      :ok -> {:ok, value}
      any -> any
    end
  end

  defp read_decimal(data, address, decimals) do
    # map address to data index
    w0 = data[address - 1]
    w1 = data[address]
    <<sign::1, reading::31>> = <<w0::16, w1::16>>

    sign =
      case sign do
        1 -> -1
        0 -> 1
      end

    case decimals do
      0 -> sign * reading
      _ -> sign * reading * :math.pow(10, -decimals)
    end
  end

  defp read_alarm(data, index) do
    w0 = data[0]
    w1 = data[1]
    <<_unused::28, a4::1, a3::1, a2::1, a1::1>> = <<w0::16, w1::16>>

    case index do
      1 -> a1
      2 -> a2
      3 -> a3
      4 -> a4
      _ -> 0
    end
  end

  defp modbus_proto(%{proto: "TCP"}), do: Modbus.Tcp.Protocol
  defp modbus_proto(%{proto: "RTU"}), do: Modbus.Rtu.Protocol

  defp connect_master(config) do
    proto = modbus_proto(config)

    case config.trans do
      "Socket" ->
        trans = Modbus.Tcp.Transport
        port = Slave.fix_port(config.port)

        case :inet.getaddr(String.to_charlist(config.host), :inet) do
          {:ok, ip} ->
            Master.start_link(trans: trans, proto: proto, ip: ip, port: port)

          any ->
            any
        end

      "Serial" ->
        trans = Modbus.Serial.Transport

        Master.start_link(
          trans: trans,
          proto: proto,
          device: config.tty,
          speed: config.speed,
          config: config.dbpsb
        )
    end
  end
end
