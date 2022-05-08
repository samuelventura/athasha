defmodule Athasha.Opto22Runner do
  alias Modbus.Master
  alias Modbus.Float
  alias Athasha.Items
  alias Athasha.Raise
  alias Athasha.Points
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

    points =
      Enum.map(config["points"], fn point ->
        code = point["code"]
        module = String.to_integer(point["module"])
        number = String.to_integer(point["number"])
        name = point["name"]

        %{
          id: "#{id} #{name}",
          type: type,
          slave: slave,
          code: code,
          module: module,
          number: number,
          name: name
        }
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      type: type,
      slave: slave,
      host: host,
      port: port,
      period: period,
      points: points
    }

    Items.update_status!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        Items.update_status!(item, :success, "Connected")
        # avoid registering duplicates
        Enum.reduce(points, %{}, fn point, map ->
          id = point.id

          if !Map.has_key?(map, id) do
            Points.register_point!(id)
          end

          Map.put(map, id, id)
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
    Enum.each(config.points, fn point ->
      case exec_point(master, point) do
        {:ok, value} ->
          Points.update_point!(point.id, value)

        {:error, reason} ->
          Points.update_point!(point.id, nil)
          Items.update_status!(item, :error, "#{inspect(point)} #{inspect(reason)}")
          Raise.error({:exec_point, point, reason})
      end
    end)
  end

  # https://documents.opto22.com/1678_Modbus_TCP_Protocol_Guide.pdf
  # <<255,255,255,255>> IEEE754 NaN from analog channel 32 (had to restart the controller)
  defp exec_point(master, point) do
    address = address(point)

    case point.code do
      # 4ch Digital, pag 12
      "01" ->
        case Master.exec(master, {:ri, point.slave, address, 1}) do
          {:ok, [value]} -> {:ok, value}
          any -> any
        end

      # 4ch Analog, pag 13
      "02" ->
        case Master.exec(master, {:rir, point.slave, address, 2}) do
          {:ok, [w0, w1]} ->
            [value] = Float.from_be([w0, w1])
            {:ok, value}

          any ->
            any
        end
    end
  end

  defp address(point = %{type: "Snap", code: "01"}), do: point.module * 4 + point.number
  defp address(point = %{type: "Snap", code: "02"}), do: point.module * 8 + point.number

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
