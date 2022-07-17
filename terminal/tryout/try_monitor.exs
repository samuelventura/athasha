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

    Port.command(port, "\e[?1000h")
    Port.command(port, "\e[?1006h")

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
