alias AthashaTerminal.Tty
target = Application.get_env(:athasha_terminal, :target)

defmodule AthashaTerminal.Tryout do
  def run(target) do
    port = Tty.open()

    case target do
      :host ->
        Tty.openvt(port, "/tmp/ash.pts")

      _ ->
        Tty.chvt(port, 2)
        Tty.openvt(port, "/dev/tty2")
    end

    # enable mouse extended
    Port.command(port, "\e[?1000h")
    Port.command(port, "\e[?1006h")
    # query window size
    Port.command(port, "\e[s\e[999;999H\e[6n\e[u")

    loop(port)
  end

  defp loop(port) do
    data = Tty.recv_data!(port)
    IO.inspect(data)
    loop(port)
  end
end

alias AthashaTerminal.Tryout
Tryout.run(target)
