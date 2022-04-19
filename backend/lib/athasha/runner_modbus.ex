defmodule Athasha.RunnerModbus do
  use GenServer
  alias Modbus.Master
  alias Athasha.Bus

  def start_link(item) do
    GenServer.start_link(__MODULE__, item)
  end

  def stop(pid) do
    GenServer.stop(pid)
  end

  def terminate(_reason, %{master: master}) do
    if master != nil, do: Master.stop(master)
  end

  def init(item) do
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
        %{slave: slave, address: address, code: code, name: name}
      end)

    config = %{host: host, port: port, delay: delay, points: points}
    Process.send_after(self(), :run, 0)
    {:ok, %{item: item, config: config, master: nil}}
  end

  def handle_info({:EXIT, pid, _reason}, state = %{master: master}) do
    state =
      case master do
        ^pid -> Map.put(state, :master, nil)
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
            Master.stop(state.master)
            Map.put(state, :master, nil)
        end

      case state.master do
        nil -> Process.send_after(self(), :run, 1000)
        _ -> Process.send_after(self(), :run, config.delay)
      end

      {:noreply, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__})
        dispatch_status(item.id, :error, "#{inspect(e)}")
        Process.send_after(self(), :run, 1000)
        {:noreply, state}
    end
  end

  defp connect(state = %{item: item, config: config, master: nil}) do
    dispatch_status(item.id, :info, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        dispatch_status(item.id, :success, "Connected")
        Map.put(state, :master, master)

      {:error, reason} ->
        dispatch_status(item.id, :error, "#{inspect(reason)}")
        state
    end
  end

  defp connect(state), do: state
  defp run_once(state = %{master: nil}), do: state

  defp run_once(%{item: item, config: config, master: master}) do
    Enum.reduce(config.points, true, fn point, res ->
      case res do
        true -> exec_point(item, master, point)
        false -> false
      end
    end)
  end

  defp exec_point(item, master, point) do
    case point.code do
      "01" ->
        case Master.exec(master, {:rc, point.slave, point.address, 1}) do
          {:ok, [value]} ->
            Bus.dispatch(:points, {item.id, point.name, value})
            true

          {:error, reason} ->
            point_error(item.id, point, reason)
            false
        end
    end
  end

  defp point_error(id, point, reason) do
    dispatch_status(
      id,
      :error,
      "#{point.slave}:#{point.address}:#{point.code}:#{point.name} #{inspect(reason)}"
    )
  end

  defp dispatch_status(id, type, msg) do
    Bus.dispatch(:status, %{id: id, type: type, msg: msg})
  end

  defp connect_master(config) do
    case :inet.getaddr(String.to_charlist(config.host), :inet) do
      {:ok, ip} -> Master.start_link(ip: ip, port: config.port)
      any -> any
    end
  end
end
