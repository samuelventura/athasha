alias AthashaTerminal.Tty
alias AthashaTerminal.Term

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

    # full reset
    Tty.write(port, "\ec")
    # enable mouse standard
    # Tty.write(port, "\e[?1000h")
    Tty.write(port, "\e[?1006h")
    Tty.write(port, "\e[?1000h")
    # query window size
    Tty.write(port, "\e[s\e[999;999H\e[6n\e[u")
    loop(port, "")
  end

  defp loop(port, buffer) do
    data = Tty.read!(port)
    {buffer, events} = Term.append(buffer, data)
    IO.inspect({data, events, buffer})
    loop(port, buffer)
  end
end

Tryout.run()
