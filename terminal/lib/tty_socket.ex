defmodule AthashaTerminal.SocketTty do
  @behaviour AthashaTerminal.Tty

  # socat STDIO fails with: Inappropriate ioctl for device
  # socat /dev/tty,raw,echo=0,escape=0x03 TCP-LISTEN:8880,reuseaddr,fork
  def tty_open(ip: ip, port: port) do
    opts = [
      :binary,
      packet: :raw,
      active: false
    ]

    ip = String.to_charlist(ip)
    {:ok, socket} = :gen_tcp.connect(ip, port, opts)
    socket
  end

  def tty_close(socket) do
    :gen_tcp.close(socket)
  end

  def tty_read!(socket) do
    case :gen_tcp.recv(socket, 0) do
      {:error, error} -> raise "#{inspect(error)}"
      {:ok, data} -> {socket, data}
    end
  end

  def tty_write!(socket, data) do
    :ok = :gen_tcp.send(socket, data)
    socket
  end
end
