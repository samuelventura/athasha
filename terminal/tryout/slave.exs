defmodule AthashaTerminal.Slave do
  alias AthashaTerminal.Tty

  def run(tty) do
    port = Tty.open()
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

alias AthashaTerminal.Slave

Slave.run("/tmp/ash.pts")
