alias AthashaTerminal.Tty

port = Tty.open()
Tty.chvt(port, 1)
Tty.close(port)

exit
