alias AthashaTerminal.Tty

Tty.chvt(1)

# exit from nerves shell (works in host as well)
Process.exit(Process.group_leader(), :kill)
