defmodule AthashaTerminal.TtyTest do
  alias AthashaTerminal.Tty
  @ctrl_c Tty.tb_key_ctrl_c()

  def test(tty) do
    port = Tty.open()
    Tty.openvt(port, tty)
    {w, h} = Tty.rec_size(port)
    IO.inspect({port, w, h})
    loop(port)
  end

  defp loop(port) do
    event = Tty.rec_event(port)
    IO.inspect(event)

    case event.key do
      @ctrl_c -> Tty.close(port)
      _ -> loop(port)
    end
  end
end
