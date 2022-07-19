alias AthashaTerminal.Tty
target = Application.get_env(:athasha_terminal, :target)

defmodule AthashaTerminal.Tryout do
  def run(target) do
    port =
      case target do
        :host ->
          IO.puts("openinig /dev/ttys004")
          Tty.open("/dev/ttys004")

        _ ->
          Tty.chvt(2)
          Tty.open("/dev/tty2")
      end

    # enable mouse extended
    Tty.write(port, "\e[?1000h")
    Tty.write(port, "\e[?1006h")
    # query window size
    Tty.write(port, "\e[s\e[999;999H\e[6n\e[u")

    loop(port)
  end

  defp loop(port) do
    data = Tty.read!(port)
    IO.inspect(data)
    loop(port)
  end
end

alias AthashaTerminal.Tryout
Tryout.run(target)
