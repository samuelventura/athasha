defmodule Athasha.Modbus.Runner do
  use GenServer
  alias Modbus.Master
  alias Modbus.Float
  alias Athasha.Runner
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
    Runner.register_status(id, :warn, "Starting...")
    Process.flag(:trap_exit, true)
    config = Jason.decode!(item.config)

    host = config["host"]
    delay = config["delay"]
    {delay, _} = Integer.parse(delay)
    port = config["port"]
    {port, _} = Integer.parse(port)

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

    reg_points(points)
    config = %{host: host, port: port, delay: delay, points: points}
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
        Runner.dispatch_status(item.id, :error, "#{inspect(e)}")
        Process.send_after(self(), :run, 1000)
        nil_points(config.points)
        state = stop_master(state)
        {:noreply, state}
    end
  end

  defp connect(state = %{item: item, config: config, master: nil}) do
    Runner.dispatch_status(item.id, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        Runner.dispatch_status(item.id, :success, "Connected")
        Map.put(state, :master, master)

      {:error, reason} ->
        Runner.dispatch_status(item.id, :error, "#{inspect(reason)}")
        state
    end
  end

  defp connect(state), do: state

  defp run_once(%{config: config, master: nil}) do
    nil_points(config.points)
    false
  end

  defp run_once(%{item: item, config: config, master: master}) do
    Enum.reduce(config.points, true, fn point, res ->
      case res do
        true ->
          case exec_point(master, point) do
            {:ok, value} ->
              set_point(point, value)
              Bus.dispatch(:points, {item.id, point.name, value})
              true

            {:error, reason} ->
              set_point(point, nil)
              point_error(item.id, point, reason)
              false
          end

        false ->
          set_point(point, nil)
          false
      end
    end)
  end

  defp set_point(point, value) do
    now = System.monotonic_time(:millisecond)
    Points.update({point.id, :read}, {now, value})
  end

  defp nil_points(points) do
    now = System.monotonic_time(:millisecond)
    points |> Enum.each(&Points.update({&1.id, :read}, {now, nil}))
  end

  defp reg_points(points) do
    now = System.monotonic_time(:millisecond)
    points |> Enum.each(&Points.register({&1.id, :read}, {now, nil}))
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

      "20" ->
        case Master.exec(master, {:rir, point.slave, point.address, 2}) do
          {:ok, values} ->
            [value] = Float.from_be(values)
            {:ok, value}

          any ->
            any
        end

      "21" ->
        case Master.exec(master, {:rhr, point.slave, point.address, 2}) do
          {:ok, values} ->
            [value] = Float.from_be(values)
            {:ok, value}

          any ->
            any
        end
    end
  end

  defp point_error(id, point, reason) do
    Runner.dispatch_status(
      id,
      :error,
      "#{point.slave}:#{point.address}:#{point.code}:#{point.name} #{inspect(reason)}"
    )
  end

  defp connect_master(config) do
    case :inet.getaddr(String.to_charlist(config.host), :inet) do
      {:ok, ip} -> Master.start_link(ip: ip, port: config.port)
      any -> any
    end
  end

  defp stop_master(state = %{master: nil}), do: state

  defp stop_master(state = %{master: master}) do
    Master.stop(master)
    Map.put(state, :master, nil)
  end
end
