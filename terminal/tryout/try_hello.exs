alias AthashaTerminal.Tty

port =
  case Tty.target() do
    :host ->
      Tty.open("/dev/ttys004")

    _ ->
      Tty.chvt(2)
      Tty.open("/dev/tty2")
  end

Tty.write(port, "hello\r\n")

Tty.close(port)
Tty.exit()
