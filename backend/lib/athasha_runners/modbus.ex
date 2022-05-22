defmodule Athasha.Runner.Modbus do
  alias Modbus.Master
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Bus
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
        factor = Number.parse_float!(input["factor"])
        offset = Number.parse_float!(input["offset"])
        decimals = String.to_integer(input["decimals"])

        %{
          id: "#{id} #{name}",
          name: name,
          getter: getter(code, slave, address),
          trim: Number.trimmer(decimals),
          calib: Number.calibrator(factor, offset)
        }
      end)

    outputs =
      Enum.map(config["outputs"], fn output ->
        slave = String.to_integer(output["slave"])
        address = String.to_integer(output["address"]) - 1
        code = output["code"]
        name = output["name"]
        factor = Number.parse_float!(output["factor"])
        offset = Number.parse_float!(output["offset"])

        %{
          id: "#{id} #{name}",
          name: name,
          setter: setter(code, slave, address),
          calib: Number.calibrator(factor, offset)
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
      inputs: inputs,
      outputs: outputs
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

        # avoid registering duplicates
        Enum.reduce(outputs, %{}, fn output, map ->
          oid = output.id

          if !Map.has_key?(map, oid) do
            PubSub.Output.register!(id, oid, output.name)
          end

          Map.put(map, oid, oid)
        end)

        names = Enum.map(inputs, & &1.name)
        PubSub.Input.reg_names!(id, names)
        PubSub.Password.register!(item, password)
        names = Enum.map(outputs, & &1.name)
        PubSub.Output.reg_names!(id, names)
        Enum.each(outputs, fn output -> Bus.register!({:output, output.id}) end)

        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, 0)
        run_loop(item, config, master, %{})

      {:error, reason} ->
        PubSub.Status.update!(item, :error, "#{inspect(reason)}")
        Raise.error({:connect_master, config, reason})
    end
  end

  defp run_loop(item, config, master, values) do
    values = wait_once(item, config, master, values)
    run_loop(item, config, master, values)
  end

  defp wait_once(item, config, master, values) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        values

      :once ->
        run_once(item, config, master, values)
        Process.send_after(self(), :once, config.period)
        %{}

      {{:output, id}, _, value} ->
        Map.put(values, id, value)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(item = %{id: id}, config, master, values) do
    Enum.each(config.inputs, fn input ->
      case input.getter.(master) do
        {:ok, value} ->
          value = input.calib.(value)
          value = input.trim.(value)
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          PubSub.Input.update!(id, input.id, input.name, nil)
          PubSub.Status.update!(item, :error, "#{inspect(input)} #{inspect(reason)}")
          Raise.error({:exec_input, input, reason})
      end
    end)

    Enum.each(config.outputs, fn output ->
      value = values[output.id]

      if value != nil do
        value = output.calib.(value)

        case output.setter.(master, value) do
          :ok ->
            PubSub.Output.update!(id, output.id, output.name, value)

          {:error, reason} ->
            PubSub.Output.update!(id, output.id, output.name, nil)
            PubSub.Status.update!(item, :error, "#{inspect(output)} #{inspect(reason)}")
            Raise.error({:exec_output, output, reason})
        end
      end
    end)
  end

  defp getter(code, slave, address) do
    case code do
      "01 Coil" ->
        fn master -> read_bit(master, :rc, slave, address) end

      "02 Input" ->
        fn master -> read_bit(master, :ri, slave, address) end

      "03 U16BE" ->
        fn master -> read_register(master, :rhr, slave, address, &Number.r_u16be/1) end

      "03 S16BE" ->
        fn master -> read_register(master, :rhr, slave, address, &Number.r_s16be/1) end

      "03 U16LE" ->
        fn master -> read_register(master, :rhr, slave, address, &Number.r_u16le/1) end

      "03 S16LE" ->
        fn master -> read_register(master, :rhr, slave, address, &Number.r_s16le/1) end

      "03 F32BED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32bed/1) end

      "03 F32LED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32led/1) end

      "03 F32BER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32ber/1) end

      "03 F32LER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32ler/1) end

      "04 U16BE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_u16be/1) end

      "04 S16BE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_s16be/1) end

      "04 U16LE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_u16le/1) end

      "04 S16LE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_s16le/1) end

      "04 F32BED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32bed/1) end

      "04 F32LED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32led/1) end

      "04 F32BER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32ber/1) end

      "04 F32LER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32ler/1) end
    end
  end

  defp setter(code, slave, address) do
    case code do
      "05 Coil" ->
        fn master, value -> write_bit(master, :fc, slave, address, value) end

      "06 U16BE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, Number.w_u16be(value))
        end

      "06 S16BE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, Number.w_s16be(value))
        end

      "06 U16LE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, Number.w_u16le(value))
        end

      "06 S16LE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, Number.w_s16le(value))
        end

      "16 F32BED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, Number.w_f32bed(value))
        end

      "16 F32LED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, Number.w_f32led(value))
        end

      "16 F32BER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, Number.w_f32ber(value))
        end

      "16 F32LER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, Number.w_f32ler(value))
        end
    end
  end

  defp read_register2(master, code, slave, address, transform) do
    case Master.exec(master, {code, slave, address, 2}) do
      {:ok, [w0, w1]} -> {:ok, transform.([w0, w1])}
      any -> any
    end
  end

  defp read_register(master, code, slave, address, transform) do
    case Master.exec(master, {code, slave, address, 1}) do
      {:ok, [value]} -> {:ok, transform.(value)}
      any -> any
    end
  end

  defp read_bit(master, code, slave, address) do
    case Master.exec(master, {code, slave, address, 1}) do
      {:ok, [value]} -> {:ok, value}
      any -> any
    end
  end

  defp write_bit(master, code, slave, address, value) do
    value = Number.to_bit(value)
    Master.exec(master, {code, slave, address, value})
  end

  defp write_register(master, code, slave, address, value) do
    Master.exec(master, {code, slave, address, value})
  end

  defp write_register2(master, code, slave, address, value) do
    Master.exec(master, {code, slave, address, value})
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
