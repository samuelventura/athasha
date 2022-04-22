defmodule Athasha.Modbus.Runner do
  use GenServer
  alias Modbus.Master
  alias Modbus.Float
  alias Athasha.Items
  alias Athasha.Points
  alias Athasha.Bus

  def start_link(item, name) do
    GenServer.start_link(__MODULE__, item, name: name)
  end

  def stop(pid) do
    GenServer.stop(pid)
  end

  def terminate(_reason, state) do
    stop_master(state)
  end

  def init(item) do
    id = item.id
    Items.register_status!(item, :warn, "Starting...")
    Process.flag(:trap_exit, true)
    config = Jason.decode!(item.config)

    trans = config["trans"]
    proto = config["proto"]
    host = config["host"]
    port = config["port"]
    {port, _} = Integer.parse(port)
    tty = config["tty"]
    speed = config["speed"]
    {speed, _} = Integer.parse(speed)
    dbpsb = config["dbpsb"]
    delay = config["delay"]
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

    reg_points(item, points)

    config = %{
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

    Process.send_after(self(), :run, 0)
    {:ok, %{item: item, config: config, master: nil}}
  end

  def handle_info({:EXIT, pid, _reason}, state = %{master: master}) do
    state =
      case master do
        ^pid -> stop_master(state)
        _ -> state
      end

    {:noreply, state}
  end

  def handle_info(:run, state = %{item: item, config: config}) do
    try do
      state = connect(state)

      state =
        case run_once(state) do
          true ->
            state

          false ->
            stop_master(state)
        end

      case state.master do
        nil -> Process.send_after(self(), :run, 1000)
        _ -> Process.send_after(self(), :run, config.delay)
      end

      {:noreply, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__})
        Items.update_status!(item, :error, "#{inspect(e)}")
        Process.send_after(self(), :run, 1000)
        nil_points(item, config.points)
        state = stop_master(state)
        {:noreply, state}
    end
  end

  defp connect(state = %{item: item, config: config, master: nil}) do
    Items.update_status!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        Items.update_status!(item, :success, "Connected")
        Map.put(state, :master, master)

      {:error, reason} ->
        Items.update_status!(item, :error, "#{inspect(reason)}")
        state
    end
  end

  defp connect(state), do: state

  defp run_once(%{item: item, config: config, master: nil}) do
    nil_points(item, config.points)
    false
  end

  defp run_once(%{item: item, config: config, master: master}) do
    Enum.reduce(config.points, true, fn point, res ->
      case res do
        true ->
          case exec_point(master, point) do
            {:ok, value} ->
              set_point(item, point, value)
              Bus.dispatch(:points, {item.id, point.name, value})
              true

            {:error, reason} ->
              set_point(item, point, nil)
              point_error(item, point, reason)
              false
          end

        false ->
          set_point(item, point, nil)
          false
      end
    end)
  end

  defp set_point(item, point, value) do
    Points.update_read!(item, point, value)
  end

  defp nil_points(item, points) do
    points |> Enum.each(fn point -> Points.update_read!(item, point, nil) end)
  end

  defp reg_points(item, points) do
    points |> Enum.each(fn point -> Points.register_read!(item, point) end)
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

  defp point_error(item, point, reason) do
    Items.update_status!(
      item,
      :error,
      "#{point.slave}:#{point.address}:#{point.code}:#{point.name} #{inspect(reason)}"
    )
  end

  defp modbus_proto(%{proto: "TCP"}), do: Modbus.Tcp.Protocol
  defp modbus_proto(%{proto: "RTU"}), do: Modbus.Rtu.Protocol

  defp connect_master(config) do
    proto = modbus_proto(config)

    case config.trans do
      "Socket" ->
        trans = Modbus.Tcp.Transport

        case :inet.getaddr(String.to_charlist(config.host), :inet) do
          {:ok, ip} -> Master.start_link(trans: trans, proto: proto, ip: ip, port: config.port)
          any -> any
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

  defp stop_master(state = %{master: nil}), do: state

  defp stop_master(state = %{master: master}) do
    Master.stop(master)
    Map.put(state, :master, nil)
  end
end
