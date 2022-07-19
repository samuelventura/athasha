alias AthashaTerminal.Tty

port =
  case Tty.target() do
    :host ->
      Tty.open("/dev/ttys004")

    _ ->
      Tty.chvt(2)
      Tty.open("/dev/tty2")
  end

# clear screen
Tty.write(port, "\e[2J")
# reset styles and colors
Tty.write(port, "\e[0m")
# blue fg color
Tty.write(port, "\e[0;34m")
# hide cursor
Tty.write(port, "\e[?25l")
# enable all mouse events
Tty.write(port, "\e[?1000h")
# enable extended xy format
Tty.write(port, "\e[?1006h")
# cursor to origin
Tty.write(port, "\e[H")
# write text
Tty.write(port, "HELLO WORLD")
# cursor to yx
Tty.write(port, "\e[2;10H")
# write text
Tty.write(port, "#{DateTime.utc_now()}")

Tty.close(port)
Tty.exit()
