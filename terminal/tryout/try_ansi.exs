alias AthashaTerminal.Tty
alias IO.ANSI

target = Application.get_env(:athasha_terminal, :target)

port = Tty.open()

case target do
  :host ->
    Tty.openvt(port, "/tmp/ash.pts")

  _ ->
    Tty.chvt(port, 2)
    Tty.openvt(port, "/dev/tty2")
end

Port.command(port, ANSI.clear())
Port.command(port, ANSI.cursor(0, 0))
Port.command(port, ANSI.blue_background())
Port.command(port, "Elixir IO.ANSI #{DateTime.utc_now()}")
Port.command(port, ANSI.reset())
# blink_off not working

# exit from nerves shell (works in host as well)
Process.exit(Process.group_leader(), :kill)
