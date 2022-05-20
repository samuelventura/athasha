defmodule Athasha.Runner.Modbus do
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

    inputs =
      Enum.map(config["inputs"], fn input ->
        slave = String.to_integer(input["slave"])
        address = String.to_integer(input["address"]) - 1
        code = input["code"]
        name = input["name"]
        factor = Decimal.new(input["factor"]) |> Decimal.to_float()
        offset = Decimal.new(input["offset"]) |> Decimal.to_float()

        %{
          id: "#{id} #{name}",
          slave: slave,
          address: address,
          code: code,
          name: name,
          factor: factor,
          offset: offset,
          getter: getter(code),
          calib: calibrator(factor, offset)
        }
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
          value = input.calib.(value)
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          PubSub.Input.update!(id, input.id, input.name, nil)
          PubSub.Status.update!(item, :error, "#{inspect(input)} #{inspect(reason)}")
          Raise.error({:exec_input, input, reason})
      end
    end)
  end

  defp calibrator(factor, offset) do
    fn value -> calibrate(value, factor, offset) end
  end

  defp calibrate(value, 1.0, 0.0), do: value
  defp calibrate(value, factor, offset), do: value * factor + offset

  defp exec_input(master, input) do
    input.getter.(master, input)
  end

  defp getter(code) do
    case code do
      "01 Coil" ->
        fn master, input -> read_bit(master, :rc, input) end

      "02 Input" ->
        fn master, input -> read_bit(master, :ri, input) end

      "03 U16BE" ->
        fn master, input -> read_register(master, :rhr, input, &u16be/1) end

      "03 S16BE" ->
        fn master, input -> read_register(master, :rhr, input, &s16be/1) end

      "03 U16LE" ->
        fn master, input -> read_register(master, :rhr, input, &u16le/1) end

      "03 S16LE" ->
        fn master, input -> read_register(master, :rhr, input, &s16le/1) end

      "03 F32BED" ->
        fn master, input -> read_register2(master, :rhr, input, &f32bed/2) end

      "03 F32LED" ->
        fn master, input -> read_register2(master, :rhr, input, &f32led/2) end

      "03 F32BER" ->
        fn master, input -> read_register2(master, :rhr, input, &f32ber/2) end

      "03 F32LER" ->
        fn master, input -> read_register2(master, :rhr, input, &f32ler/2) end

      "04 U16BE" ->
        fn master, input -> read_register(master, :rir, input, &u16be/1) end

      "04 S16BE" ->
        fn master, input -> read_register(master, :rir, input, &s16be/1) end

      "04 U16LE" ->
        fn master, input -> read_register(master, :rir, input, &u16le/1) end

      "04 S16LE" ->
        fn master, input -> read_register(master, :rir, input, &s16le/1) end

      "04 F32BED" ->
        fn master, input -> read_register2(master, :rir, input, &f32bed/2) end

      "04 F32LED" ->
        fn master, input -> read_register2(master, :rir, input, &f32led/2) end

      "04 F32BER" ->
        fn master, input -> read_register2(master, :rir, input, &f32ber/2) end

      "04 F32LER" ->
        fn master, input -> read_register2(master, :rir, input, &f32ler/2) end
    end
  end

  defp u16be(w16) do
    <<value::unsigned-integer-big-16>> = <<w16::16>>
    {:ok, value}
  end

  defp s16be(w16) do
    <<value::signed-integer-big-16>> = <<w16::16>>
    {:ok, value}
  end

  defp u16le(w16) do
    <<value::unsigned-integer-little-16>> = <<w16::16>>
    {:ok, value}
  end

  defp s16le(w16) do
    <<value::signed-integer-little-16>> = <<w16::16>>
    {:ok, value}
  end

  defp f32bed(w0, w1) do
    <<value::float-big-32>> = <<w0::16, w1::16>>
    {:ok, value}
  end

  defp f32led(w0, w1) do
    <<value::float-little-32>> = <<w0::16, w1::16>>
    {:ok, value}
  end

  defp f32ber(w0, w1) do
    <<value::float-big-32>> = <<w1::16, w0::16>>
    {:ok, value}
  end

  defp f32ler(w0, w1) do
    <<value::float-little-32>> = <<w1::16, w0::16>>
    {:ok, value}
  end

  defp read_register2(master, code, input, transform) do
    case Master.exec(master, {code, input.slave, input.address, 2}) do
      {:ok, [w0, w1]} ->
        transform.(w0, w1)

      any ->
        any
    end
  end

  defp read_register(master, code, input, transform) do
    case Master.exec(master, {code, input.slave, input.address, 1}) do
      {:ok, [w16]} ->
        transform.(w16)

      any ->
        any
    end
  end

  defp read_bit(master, code, input) do
    case Master.exec(master, {code, input.slave, input.address, 1}) do
      {:ok, [value]} -> {:ok, value}
      any -> any
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
