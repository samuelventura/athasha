alias AthashaTerminal.Tty

target = Application.get_env(:athasha_terminal, :target)

port =
  case target do
    :host ->
      Tty.open("/dev/ttys004")

    _ ->
      Tty.chvt(2)
      Tty.open("/dev/tty2")
  end

Tty.write(port, "hello\r\n")

Tty.close(port)

# exit from nerves shell (works in host as well)
Process.exit(Process.group_leader(), :kill)
