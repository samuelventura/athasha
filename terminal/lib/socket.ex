defmodule Terminal.Socket do
  # socat file:/dev/tty,icanon=0,echo=0,min=0,escape=0x03 tcp-l:8880,reuseaddr
  # socat STDIO fails with: Inappropriate ioctl for device
  # min=0 required to answer size query immediatelly
  # fork useless because term won't answer size query on reconnection
  # escape=0x03 required to honor escape sequences
  # while true; do socat file:/dev/tty,icanon=0,echo=0,escape=0x03,min=0 tcp-l:8880,reuseaddr; done
  # to exit: ctrl-z, then jobs, then kill %1
  def open(ip: ip, port: port) do
    opts = [
      :binary,
      packet: :raw,
      active: true
    ]

    ip = String.to_charlist(ip)
    {:ok, socket} = :gen_tcp.connect(ip, port, opts)
    socket
  end

  def close(socket), do: :gen_tcp.close(socket)
  def handle(socket, {:tcp, socket, data}), do: {socket, true, data}
  def handle(socket, _), do: {socket, false}

  def read!(socket) do
    receive do
      {:tcp, ^socket, data} ->
        {socket, data}

      any ->
        raise "#{inspect(any)}"
    end
  end

  def write!(socket, data) do
    :ok = :gen_tcp.send(socket, data)
    socket
  end
end
