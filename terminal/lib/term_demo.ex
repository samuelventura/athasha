defmodule AthashaTerminal.TermDemo do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.Canvas

  def app_init(_opts), do: {nil, nil}
  def app_handle(state, _event), do: {state, nil}
  def app_execute(_cmd), do: nil

  def app_render(_state, canvas) do
    canvas = Canvas.clear(canvas, :colors)

    # these are the linux usable colors
    # combinations of dimmed/bold mess with these usable
    # colors if in excess of the 16 available slots
    canvas =
      for i <- 0..15, reduce: canvas do
        canvas ->
          for j <- 0..7, reduce: canvas do
            canvas ->
              canvas = Canvas.move(canvas, 8 * j, i)
              canvas = Canvas.color(canvas, :bgcolor, j)
              canvas = Canvas.color(canvas, :fgcolor, i)
              canvas = Canvas.write(canvas, " Demo ")
              canvas
          end
      end

    canvas
  end
end

defmodule AthashaTerminal.TermCodeSocketDemo do
  use AthashaTerminal.Runner,
    term: AthashaTerminal.TermCode,
    tty: AthashaTerminal.SocketTty,
    app: AthashaTerminal.TermDemo

  # socat STDIO fails with: Inappropriate ioctl for device
  # socat /dev/tty,raw,echo=0,escape=0x03 TCP-LISTEN:8880,reuseaddr,fork
  def launch(ip: ip, port: port) do
    tty = [ip: ip, port: port]
    start_link(tty, [])
  end
end
