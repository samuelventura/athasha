defmodule Athasha.Runner.Laurel do
  alias Modbus.Master
  alias Athasha.Raise
  alias Athasha.PubSub
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

        Enum.map(slave["inputs"], fn input ->
          code = input["code"]
          name = input["name"]

          %{
            id: "#{id} #{name}",
            name: name,
            getter: getter(code, address, decimals)
          }
        end)
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
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

    PubSub.Status.update!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        PubSub.Status.update!(item, :success, "Connected")
        # avoid registering duplicates
        Enum.reduce(slaves, %{}, fn inputs, map ->
          Enum.reduce(inputs, map, fn input, map ->
            iid = input.id

            if !Map.has_key?(map, iid) do
              PubSub.Input.register!(id, iid, input.name)
            end

            Map.put(map, iid, input)
          end)
        end)

        inputs =
          Enum.reduce(slaves, [], fn inputs, list ->
            Enum.reduce(inputs, list, fn input, list ->
              [input | list]
            end)
          end)
          |> Enum.reverse()

        names = Enum.map(inputs, & &1.name)
        PubSub.Input.reg_names!(id, names)
        PubSub.Output.reg_names!(id, [])
        PubSub.Password.register!(item, password)

        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, 0)
        run_loop(item, config, master)

      {:error, reason} ->
        PubSub.Status.update!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_master, config, reason})
    end
  end

  defp run_loop(item, config, master) do
    wait_once(item, config, master)
    run_loop(item, config, master)
  end

  defp wait_once(item, config, master) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, master)
        Process.send_after(self(), :once, config.period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item = %{id: id}, config, master) do
    Enum.each(config.slaves, fn inputs ->
      Enum.reduce(inputs, nil, fn input, alarm ->
        case input.getter.(master, alarm) do
          {:ok, {alarm, index}} ->
            value = laurel_bit(alarm, index)
            PubSub.Input.update!(id, input.id, input.name, value)
            alarm

          {:ok, value} ->
            PubSub.Input.update!(id, input.id, input.name, value)
            alarm

          {:error, reason} ->
            PubSub.Input.update!(id, input.id, input.name, nil)
            PubSub.Status.update!(item, :error, "#{inspect(input)} #{inspect(reason)}")
            Raise.error({:exec_input, input, reason})
        end
      end)
    end)
  end

  defp getter(code, slave, decimals) do
    case code do
      "Item 1" -> fn master, _alarm -> laurel_decimal(master, slave, 3, decimals) end
      "Item 2" -> fn master, _alarm -> laurel_decimal(master, slave, 9, decimals) end
      "Item 3" -> fn master, _alarm -> laurel_decimal(master, slave, 11, decimals) end
      "Peak" -> fn master, _alarm -> laurel_decimal(master, slave, 5, decimals) end
      "Valley" -> fn master, _alarm -> laurel_decimal(master, slave, 7, decimals) end
      "Alarm 1" -> fn master, alarm -> laurel_alarm(master, slave, 1, alarm) end
      "Alarm 2" -> fn master, alarm -> laurel_alarm(master, slave, 2, alarm) end
      "Alarm 3" -> fn master, alarm -> laurel_alarm(master, slave, 3, alarm) end
      "Alarm 4" -> fn master, alarm -> laurel_alarm(master, slave, 4, alarm) end
    end
  end

  defp laurel_decimal(master, slave, address, decimals) do
    # second slave is timing out randomly
    # reading decimal digits causes resets
    :timer.sleep(5)

    case Master.exec(master, {:rir, slave, address, 2}) do
      {:ok, [w0, w1]} ->
        <<sign::1, reading::31>> = <<w0::16, w1::16>>

        sign =
          case sign do
            1 -> -1
            0 -> 1
          end

        value =
          case decimals do
            0 -> sign * reading
            _ -> sign * reading * :math.pow(10, -decimals)
          end

        {:ok, value}

      any ->
        any
    end
  end

  defp laurel_alarm(master, slave, index, nil) do
    # second slave is timing out randomly
    :timer.sleep(5)

    case Master.exec(master, {:rir, slave, 1, 2}) do
      {:ok, [w0, w1]} -> {:ok, {[w0, w1], index}}
      any -> any
    end
  end

  defp laurel_alarm(_master, _input, index, alarm) do
    {:ok, {alarm, index}}
  end

  defp laurel_bit([w0, w1], index) do
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

        case :inet.getaddr(String.to_charlist(config.host), :inet) do
          {:ok, ip} ->
            Master.start_link(trans: trans, proto: proto, ip: ip, port: config.port)

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
