alias AthashaTerminal.Tty

port = 8899

tty =
  case Tty.target() do
    :host ->
      "/tmp/ash.tty"

    _ ->
      Tty.chvt(2)
      "/dev/tty2"
  end

opts = [:binary, ip: {0, 0, 0, 0}, packet: :raw, active: true]
{:ok, listener} = :gen_tcp.listen(port, opts)
{:ok, socket} = :gen_tcp.accept(listener)
port = Tty.open(tty)

loop = fn port, socket, loop ->
  receive do
    {:tcp, data} -> Tty.write!(port, data)
    {^port, data} -> :gen_tcp.write(socket, data)
  end

  loop.(port, socket, loop)
end

loop.(port, socket, loop)
