alias AthashaTerminal.Tty

defmodule Tryout do
  def run() do
    port =
      case Tty.target() do
        :host ->
          Tty.open("/tmp/ash.tty")

        _ ->
          Tty.chvt(2)
          Tty.open("/dev/tty2")
      end

    # enable mouse extended
    Tty.write(port, "\e[?1000h")
    Tty.write(port, "\e[?1006h")
    # set size (not working in vscode)
    # Tty.write(port, "\e[8;30;100t")
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

Tryout.run()
