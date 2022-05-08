defmodule Athasha.LaurelRunner do
  alias Modbus.Master
  alias Athasha.Items
  alias Athasha.Raise
  alias Athasha.Points
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

    slaves =
      Enum.map(config["slaves"], fn slave ->
        address = String.to_integer(slave["address"])
        decimals = String.to_integer(slave["decimals"])

        Enum.map(slave["points"], fn point ->
          code = point["code"]
          name = point["name"]

          %{
            id: "#{id} #{name}",
            slave: address,
            decimals: decimals,
            code: code,
            name: name
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

    Items.update_status!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        Items.update_status!(item, :success, "Connected")
        # avoid registering duplicates
        Enum.reduce(slaves, %{}, fn points, map ->
          Enum.reduce(points, map, fn point, map ->
            id = point.id

            if !Map.has_key?(map, point.id) do
              Points.register_point!(id)
            end

            Map.put(map, id, id)
          end)
        end)

        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, 0)
        run_loop(item, config, master)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
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
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, master)
        Process.send_after(self(), :once, config.period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item, config, master) do
    Enum.each(config.slaves, fn points ->
      Enum.reduce(points, nil, fn point, alarm ->
        case exec_point(master, point, alarm) do
          {:ok, {alarm, index}} ->
            value = laurel_bit(alarm, index)
            Points.update_point!(point.id, value)
            alarm

          {:ok, value} ->
            Points.update_point!(point.id, value)
            alarm

          {:error, reason} ->
            Points.update_point!(point.id, nil)
            Items.update_status!(item, :error, "#{inspect(point)} #{inspect(reason)}")
            Raise.error({:exec_point, point, reason})
        end
      end)
    end)
  end

  defp exec_point(master, point, alarm) do
    case point.code do
      # Item 1
      "01" ->
        laurel_decimal(master, point, 3)

      # Item 2
      "02" ->
        laurel_decimal(master, point, 9)

      # Item 3
      "03" ->
        laurel_decimal(master, point, 11)

      # Peak
      "11" ->
        laurel_decimal(master, point, 5)

      # Valey
      "12" ->
        laurel_decimal(master, point, 7)

      # Alarm 1
      "21" ->
        laurel_alarm(master, point, 1, alarm)

      # Alarm 2
      "22" ->
        laurel_alarm(master, point, 2, alarm)

      # Alarm 3
      "23" ->
        laurel_alarm(master, point, 3, alarm)

      # Alarm 4
      "24" ->
        laurel_alarm(master, point, 4, alarm)
    end
  end

  defp laurel_decimal(master, point, address) do
    # second slave is timing out randomly
    :timer.sleep(5)
    # {:ok, [d0]} = Master.exec master, {:rhr, 1, 87, 1} causes resets
    case Master.exec(master, {:rir, point.slave, address, 2}) do
      {:ok, [w0, w1]} ->
        <<sign::1, reading::31>> = <<w0::16, w1::16>>

        sign =
          case sign do
            1 -> -1
            0 -> 1
          end

        value = Decimal.new(sign, reading, -point.decimals)
        {:ok, value}

      any ->
        any
    end
  end

  defp laurel_alarm(master, point, index, nil) do
    # second slave is timing out randomly
    :timer.sleep(5)

    case Master.exec(master, {:rir, point.slave, 1, 2}) do
      {:ok, [w0, w1]} -> {:ok, {[w0, w1], index}}
      any -> any
    end
  end

  defp laurel_alarm(_master, _point, index, alarm) do
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
