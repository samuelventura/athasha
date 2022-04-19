defmodule Athasha.RunnerModbus do
  alias Modbus.Master
  alias Athasha.Bus

  def start_link(item) do
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
    spawn(fn -> loop(item, config) end)
  end

  def stop(pid) do
    Process.exit(pid, :stop)
  end

  defp loop(item, config) do
    try do
      loop_cycle(item, config)
    rescue
      e ->
        status(item.id, :error, "#{inspect(e)}")
        # IO.inspect(e)
    end

    status(item.id, :info, "Sleeping...")
    :timer.sleep(1000)
    loop(item, config)
  end

  defp loop_cycle(item, config) do
    status(item.id, :info, "Connecting...")

    case connect(config) do
      {:ok, master} ->
        status(item.id, :success, "Connected")
        loop_cycle(item, config, master)
        Master.stop(master)

      {:error, reason} ->
        status(item.id, :error, "#{inspect(reason)}")
    end
  end

  defp loop_cycle(item, config, master) do
    Stream.iterate(0, &(&1 + 1))
    |> Enum.reduce_while(true, fn _i, res ->
      res =
        Enum.reduce(config.points, res, fn point, res ->
          case res do
            true -> exec_point(item, master, point)
            false -> false
          end
        end)

      case res do
        true ->
          :timer.sleep(config.delay)
          {:cont, true}

        false ->
          {:halt, false}
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
    status(
      id,
      :error,
      "#{point.slave}:#{point.address}:#{point.code}:#{point.name} #{inspect(reason)}"
    )
  end

  defp status(id, type, msg) do
    Bus.dispatch(:status, %{id: id, type: type, msg: msg})
  end

  defp connect(config) do
    case :inet.getaddr(String.to_charlist(config.host), :inet) do
      {:ok, ip} -> Master.start_link(ip: ip, port: config.port)
      any -> any
    end
  end
end
