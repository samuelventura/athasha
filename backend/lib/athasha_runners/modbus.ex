defmodule Athasha.Runner.Modbus do
  alias Modbus.Master
  alias Athasha.Slave
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Item
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

        %{
          id: "#{id} #{name}",
          name: name,
          getter: getter(code, slave, address),
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
          calib: Number.calibrator(factor, offset),
          reverse: Number.reversed(factor, offset)
        }
      end)

    config = %{
      item: Item.head(item),
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

    case connect_master(config) do
      {:ok, master} ->
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
        names = Enum.map(outputs, & &1.name)
        PubSub.Output.reg_names!(id, names)
        Enum.each(outputs, fn output -> Bus.register!({:write, output.id}) end)
        run_once(item, config, master, %{})
        PubSub.Status.update!(item, :success, "Connected")
        PubSub.Password.register!(item, password)
        Process.send_after(self(), :status, @status)
        Process.send_after(self(), :once, period)
        run_loop(item, config, master, %{}, period)

      {:error, reason} ->
        Raise.error({:connect, reason})
    end
  end

  defp run_loop(item, config, master, values, period) do
    values = wait_once(item, config, master, values, period)
    run_loop(item, config, master, values, period)
  end

  defp wait_once(item, config, master, values, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        values

      :once ->
        run_once(item, config, master, values)
        Process.send_after(self(), :once, period)
        %{}

      {{:write, id}, _, value} ->
        Map.put(values, id, value)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(%{id: id}, config, master, values) do
    Enum.each(config.inputs, fn input ->
      case input.getter.(master) do
        {:ok, value} ->
          value = input.calib.(value)
          PubSub.Input.update!(id, input.id, input.name, value)

        {:error, reason} ->
          Raise.error({:input, reason, input.id})
      end
    end)

    Enum.each(config.outputs, fn output ->
      value = values[output.id]

      if value != nil do
        value = output.calib.(value)

        case output.setter.(master, value) do
          {:ok, value} ->
            reversed = output.reverse.(value)
            PubSub.Output.update!(id, output.id, output.name, reversed)

          {:error, reason} ->
            Raise.error({:output, reason, output.id, value})
        end
      end
    end)
  end

  defp getter(code, slave, address) do
    case code do
      # 03
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

      # F32
      "03 F32BED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32bed/1) end

      "03 F32LED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32led/1) end

      "03 F32BER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32ber/1) end

      "03 F32LER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_f32ler/1) end

      # S32
      "03 S32BED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_s32bed/1) end

      "03 S32LED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_s32led/1) end

      "03 S32BER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_s32ber/1) end

      "03 S32LER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_s32ler/1) end

      # U32
      "03 U32BED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_u32bed/1) end

      "03 U32LED" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_u32led/1) end

      "03 U32BER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_u32ber/1) end

      "03 U32LER" ->
        fn master -> read_register2(master, :rhr, slave, address, &Number.r_u32ler/1) end

      # 04
      "04 U16BE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_u16be/1) end

      "04 S16BE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_s16be/1) end

      "04 U16LE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_u16le/1) end

      "04 S16LE" ->
        fn master -> read_register(master, :rir, slave, address, &Number.r_s16le/1) end

      # F32
      "04 F32BED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32bed/1) end

      "04 F32LED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32led/1) end

      "04 F32BER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32ber/1) end

      "04 F32LER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_f32ler/1) end

      # S32
      "04 S32BED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_s32bed/1) end

      "04 S32LED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_s32led/1) end

      "04 S32BER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_s32ber/1) end

      "04 S32LER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_s32ler/1) end

      # U32
      "04 U32BED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_u32bed/1) end

      "04 U32LED" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_u32led/1) end

      "04 U32BER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_u32ber/1) end

      "04 U32LER" ->
        fn master -> read_register2(master, :rir, slave, address, &Number.r_u32ler/1) end
    end
  end

  defp setter(code, slave, address) do
    case code do
      "05 Coil" ->
        fn master, value -> write_bit(master, :fc, slave, address, value) end

      "06 U16BE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, value, &Number.w_u16be/1)
        end

      "06 S16BE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, value, &Number.w_s16be/1)
        end

      "06 U16LE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, value, &Number.w_u16le/1)
        end

      "06 S16LE" ->
        fn master, value ->
          write_register(master, :phr, slave, address, value, &Number.w_s16le/1)
        end

      # F32
      "16 F32BED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_f32bed/1)
        end

      "16 F32LED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_f32led/1)
        end

      "16 F32BER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_f32ber/1)
        end

      "16 F32LER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_f32ler/1)
        end

      # S32
      "16 S32BED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_s32bed/1)
        end

      "16 S32LED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_s32led/1)
        end

      "16 S32BER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_s32ber/1)
        end

      "16 S32LER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_s32ler/1)
        end

      # U32
      "16 U32BED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_u32bed/1)
        end

      "16 U32LED" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_u32led/1)
        end

      "16 U32BER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_u32ber/1)
        end

      "16 U32LER" ->
        fn master, value ->
          write_register2(master, :phr, slave, address, value, &Number.w_u32ler/1)
        end
    end
  end

  defp read_register2(master, code, slave, address, transform) do
    case Master.exec(master, {code, slave, address, 2}) do
      {:ok, [w0, w1]} ->
        value = transform.([w0, w1])
        {:ok, value}

      any ->
        any
    end
  end

  defp read_register(master, code, slave, address, transform) do
    case Master.exec(master, {code, slave, address, 1}) do
      {:ok, [value]} ->
        value = transform.(value)
        {:ok, value}

      any ->
        any
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

    case Master.exec(master, {code, slave, address, value}) do
      :ok -> {:ok, value}
      any -> any
    end
  end

  defp write_register(master, code, slave, address, value, transform) do
    value = transform.(value)

    case Master.exec(master, {code, slave, address, value}) do
      :ok -> {:ok, value}
      any -> any
    end
  end

  defp write_register2(master, code, slave, address, value, transform) do
    case Master.exec(master, {code, slave, address, transform.(value)}) do
      :ok -> {:ok, value}
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
        port = Slave.fix_port(config.port)

        case :inet.getaddr(String.to_charlist(config.host), :inet) do
          {:ok, ip} ->
            Master.start_link(trans: trans, proto: proto, ip: ip, port: port)

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
