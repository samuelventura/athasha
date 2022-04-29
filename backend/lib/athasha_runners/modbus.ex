defmodule Athasha.Modbus.Runner do
  alias Modbus.Master
  alias Modbus.Float
  alias Athasha.Items
  alias Athasha.Raise
  alias Athasha.Points
  @status 1000

  def run(item) do
    id = item.id
    config = Jason.decode!(item.config)
    setts = config["setts"]
    trans = setts["trans"]
    proto = setts["proto"]
    host = setts["host"]
    port = setts["port"]
    {port, _} = Integer.parse(port)
    tty = setts["tty"]
    speed = setts["speed"]
    {speed, _} = Integer.parse(speed)
    dbpsb = setts["dbpsb"]
    delay = setts["delay"]
    {delay, _} = Integer.parse(delay)

    points =
      Enum.map(config["points"], fn point ->
        slave = point["slave"]
        {slave, _} = Integer.parse(slave)
        address = point["address"]
        {address, _} = Integer.parse(address)
        code = point["code"]
        name = point["name"]
        %{id: "#{id} #{name}", slave: slave, address: address, code: code, name: name}
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
      delay: delay,
      points: points
    }

    Items.update_status!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        Items.update_status!(item, :success, "Connected")
        points |> Enum.each(&Points.register_point!(&1.id))
        Process.send_after(self(), :status, @status)
        run_loop(item, config, master)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_master, config, reason})
    end
  end

  defp run_loop(item, config, master) do
    throttled_status(item)
    run_once(item, config, master)
    :timer.sleep(config.delay)
    run_loop(item, config, master)
  end

  defp throttled_status(item) do
    receive do
      :status ->
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      other ->
        Raise.error({:receive, other})
    after
      0 -> nil
    end
  end

  defp run_once(item, config, master) do
    Enum.each(config.points, fn point ->
      case exec_point(master, point) do
        {:ok, value} ->
          Points.update_point!(point.id, value)

        {:error, reason} ->
          Items.update_status!(item, :error, "#{inspect(point)} #{inspect(reason)}")
          Raise.error({:exec_point, point, reason})
      end
    end)
  end

  defp exec_point(master, point) do
    case point.code do
      "01" ->
        case Master.exec(master, {:rc, point.slave, point.address, 1}) do
          {:ok, [value]} -> {:ok, value}
          any -> any
        end

      "02" ->
        case Master.exec(master, {:ri, point.slave, point.address, 1}) do
          {:ok, [value]} -> {:ok, value}
          any -> any
        end

      # 22 Opto22 Float32
      "22" ->
        case Master.exec(master, {:rir, point.slave, point.address, 2}) do
          {:ok, [w0, w1]} ->
            [value] = Float.from_be([w0, w1])
            {:ok, value}

          any ->
            any
        end

      # 30 Laurel Reading
      "30" ->
        laurel_decimal(master, point, 3)

      "31" ->
        laurel_decimal(master, point, 5)

      "32" ->
        laurel_decimal(master, point, 7)

      "33" ->
        laurel_alarm(master, point)
    end
  end

  defp laurel_decimal(master, point, address) do
    # slave 2 is timing out randomly
    :timer.sleep(5)
    # {:ok, [d0]} = Master.exec master, {:rhr, 1, 87, 1} causes resets
    # point.address is the number of places to shift left the decimal point
    case Master.exec(master, {:rir, point.slave, address, 2}) do
      {:ok, [w0, w1]} ->
        <<sign::1, reading::31>> = <<w0::16, w1::16>>

        sign =
          case sign do
            1 -> -1
            0 -> 1
          end

        value = Decimal.new(sign, reading, -point.address)
        {:ok, value}

      any ->
        any
    end
  end

  defp laurel_alarm(master, point) do
    # slave 2 is timing out randomly
    :timer.sleep(5)

    case Master.exec(master, {:rir, point.slave, 1, 2}) do
      {:ok, [w0, w1]} ->
        <<_unused::28, a4::1, a3::1, a2::1, a1::1>> = <<w0::16, w1::16>>

        value =
          case point.address do
            1 -> a1
            2 -> a2
            3 -> a3
            4 -> a4
            _ -> 0
          end

        {:ok, value}

      any ->
        any
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
        trans = Baud.Transport

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
