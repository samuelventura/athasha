defmodule Terminal.Label do
  @behaviour Terminal.Window
  alias Terminal.Canvas
  alias Terminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {String.length(text), 1})
    theme = Keyword.get(opts, :theme, :default)
    theme = Theme.get(theme)
    bgcolor = Keyword.get(opts, :bgcolor, theme.back_readonly)
    fgcolor = Keyword.get(opts, :fgcolor, theme.fore_readonly)

    %{
      text: text,
      size: size,
      origin: origin,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(state, name, value), do: Map.get(state, name, value)
  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      text: text,
      size: {w, _h},
      bgcolor: bgcolor,
      fgcolor: fgcolor
    } = state

    text = String.pad_trailing(text, w)
    canvas = Canvas.color(canvas, :bgcolor, bgcolor)
    canvas = Canvas.color(canvas, :fgcolor, fgcolor)
    canvas = Canvas.move(canvas, 0, 0)
    Canvas.write(canvas, text)
  end
end
