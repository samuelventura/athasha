defmodule Terminal.Demo do
  @behaviour Terminal.App
  alias Terminal.Canvas

  def init(_opts), do: {nil, nil}
  def handle(state, _event), do: {state, nil}

  def render(_state, canvas) do
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

  def execute(_cmd), do: nil
end
