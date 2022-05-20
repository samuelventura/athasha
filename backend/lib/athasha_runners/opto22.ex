defmodule Athasha.Runner.Opto22 do
  alias Modbus.Master
  alias Athasha.Raise
  alias Athasha.PubSub
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
      inputs: inputs
    }

    PubSub.Status.update!(item, :warn, "Connecting...")

    case connect_master(config) do
      {:ok, master} ->
        PubSub.Status.update!(item, :success, "Connected")
        # avoid registering duplicates
        Enum.reduce(inputs, %{}, fn input, map ->
          iid = input.id

          if !Map.has_key?(map, iid) do
            PubSub.Input.register!(id, iid, input.name)
          end

          Map.put(map, iid, iid)
        end)

        names = Enum.map(inputs, & &1.name)
        PubSub.Input.reg_names!(id, names)
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
    Enum.each(config.inputs, fn input ->
      case exec_input(master, input) do
        {:ok, value} ->
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          PubSub.Input.update!(id, input.id, input.name, nil)
          PubSub.Status.update!(item, :error, "#{inspect(input)} #{inspect(reason)}")
          Raise.error({:exec_input, input, reason})
      end
    end)
  end

  # https://documents.opto22.com/1678_Modbus_TCP_Protocol_Guide.pdf
  # <<255,255,255,255>> IEEE754 NaN from analog channel 32 (had to restart the controller)
  defp exec_input(master, input) do
    address = address(input)

    case input.code do
      # 4ch Digital, pag 12
      "01" ->
        case Master.exec(master, {:ri, input.slave, address, 1}) do
          {:ok, [value]} -> {:ok, value}
          any -> any
        end

      # 4ch Analog, pag 13
      "02" ->
        case Master.exec(master, {:rir, input.slave, address, 2}) do
          {:ok, [w0, w1]} ->
            <<value::float-big-32>> = <<w0::16, w1::16>>
            {:ok, value}

          any ->
            any
        end
    end
  end

  defp address(input = %{type: "Snap", code: "01"}), do: input.module * 4 + (input.number - 1)
  defp address(input = %{type: "Snap", code: "02"}), do: input.module * 8 + 2 * (input.number - 1)

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
