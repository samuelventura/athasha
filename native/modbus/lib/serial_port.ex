defmodule Modbus.Sport do
  def open(device, speed, config) do
    exec =
      case :os.type() do
        {:unix, :darwin} -> "/dotnet/serial"
        {:unix, :linux} -> "/dotnet/serial"
        {:win32, :nt} -> "/dotnet/serial.exe"
      end

    exec = Path.join(:code.priv_dir(:ports), exec)
    args = [device, to_string(speed), config]
    opts = [:binary, :exit_status, packet: 2, args: args]
    port = Port.open({:spawn_executable, exec}, opts)
    {:ok, port}
  end

  def close(port) do
    true = Port.close(port)
    :ok
  end

  def read(port) do
    true = Port.command(port, ["r"])

    receive do
      {^port, {:exit_status, status}} -> {:error, {:exit, status}}
      {^port, {:data, data}} -> {:ok, data}
    end
  end

  def write(port, data) do
    true = Port.command(port, ["w", data])
    :ok
  end

  def master_reqres(port, packet, count, timeout) do
    <<b0::8, b1::8>> = <<count::unsigned-integer-16>>
    true = Port.command(port, ["m", b0, b1, packet])

    receive do
      {^port, {:exit_status, status}} -> {:error, {:exit, status}}
      {^port, {:data, data}} -> {:ok, data}
    after
      timeout -> {:error, :timeout}
    end
  end

  def slave_waitreq(port) do
    true = Port.command(port, ["s"])

    receive do
      {^port, {:exit_status, status}} -> {:error, {:exit, status}}
      {^port, {:data, data}} -> {:ok, data}
    end
  end
end
