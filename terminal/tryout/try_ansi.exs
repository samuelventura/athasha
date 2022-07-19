alias AthashaTerminal.Tty
alias IO.ANSI

port =
  case Tty.target() do
    :host ->
      Tty.open("/tmp/ash.tty")

    _ ->
      Tty.chvt(2)
      Tty.open("/dev/tty2")
  end

Tty.write(port, ANSI.clear())
Tty.write(port, ANSI.cursor(0, 0))
Tty.write(port, ANSI.blue_background())
Tty.write(port, "Elixir IO.ANSI #{DateTime.utc_now()}")
Tty.write(port, ANSI.reset())
# blink_off not working

Tty.close(port)
Tty.exit()