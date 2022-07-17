alias AthashaTerminal.Tty

target = Application.get_env(:athasha_terminal, :target)

port = Tty.open()

case target do
  :host ->
    Tty.openvt(port, "/tmp/ash.pts")

  _ ->
    Tty.chvt(port, 2)
    Tty.openvt(port, "/dev/tty2")
end

# clear screen
Port.command(port, "\e[2J")
# reset styles and colors
Port.command(port, "\e[0m")
# blue fg color
Port.command(port, "\e[0;34m")
# hide cursor
Port.command(port, "\e[?25l")
# enable all mouse events
Port.command(port, "\e[?1000h")
# enable extended xy format
Port.command(port, "\e[?1006h")
# cursor to origin
Port.command(port, "\e[H")
# write text
Port.command(port, "HELLO WORLD")
# cursor to yx
Port.command(port, "\e[2;10H")
# write text
Port.command(port, "#{DateTime.utc_now()}")

# exit from nerves shell (works in host as well)
Process.exit(Process.group_leader(), :kill)
