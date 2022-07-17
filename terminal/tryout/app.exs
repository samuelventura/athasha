defmodule AthashaTerminal.Tryout do
  alias AthashaTerminal.Tty

  def run(tty, vt) do
    port = Tty.open()
    Tty.chvt(port, vt)
    Tty.openvt(port, tty)
    loop(port)
  end

  defp loop(port) do
    data = Tty.recv_data!(port)
    IO.inspect(data)
    Port.command(port, data)
    loop(port)
  end
end

alias AthashaTerminal.Tryout

tty = "/dev/tty2"

Tryout.run(tty, 2)
