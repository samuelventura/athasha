defmodule Terminal.Demo do
  @behaviour Terminal.App
  alias Terminal.Canvas
  alias Terminal.Panel
  alias Terminal.Select

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    panel = Panel.init(size: size, focused: true, root: true)

    {panel, select} =
      Panel.append(panel, Select, origin: {1, 3}, size: {10, 6}, items: ["Color", "Button"])

    state = %{select: select, panel: panel, item: "Color"}

    {state, nil}
  end

  def handle(%{select: select, panel: panel} = state, event) do
    {panel, event} = Panel.handle(panel, event)
    state = %{state | panel: panel}

    state =
      case event do
        {^select, {:item, item}} -> %{state | item: item}
        _ -> state
      end

    {state, nil}
  end

  def render(%{panel: panel, item: item}, canvas) do
    canvas = Panel.render(panel, canvas)

    case item do
      "Color" ->
        canvas = Canvas.clear(canvas, :colors)
        # these are the linux usable colors
        # combinations of dimmed/bold mess with these usable
        # colors if in excess of the 16 available slots
        for i <- 0..15, reduce: canvas do
          canvas ->
            for j <- 0..7, reduce: canvas do
              canvas ->
                canvas = Canvas.move(canvas, 16 + 8 * j, i)
                canvas = Canvas.color(canvas, :bgcolor, j)
                canvas = Canvas.color(canvas, :fgcolor, i)
                canvas = Canvas.write(canvas, " Demo ")
                canvas
            end
        end

      "Button" ->
        canvas
    end
  end

  def execute(_cmd), do: nil
end
