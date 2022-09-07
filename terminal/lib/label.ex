defmodule Terminal.Label do
  @behaviour Terminal.Window
  alias Terminal.Canvas
  alias Terminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {String.length(text), 1})
    visible = Keyword.get(opts, :visible, true)
    theme = Keyword.get(opts, :theme, :default)
    theme = Theme.get(theme)
    bgcolor = Keyword.get(opts, :bgcolor, theme.back_readonly)
    fgcolor = Keyword.get(opts, :fgcolor, theme.fore_readonly)

    %{
      text: text,
      size: size,
      origin: origin,
      visible: visible,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    }
  end

  def bounds(%{origin: {x, y}, size: {w, h}}), do: {x, y, w, h}
  def focused(state, _), do: state
  def focused(_), do: false
  def focusable(_), do: false
  def findex(_), do: -1
  def children(_state), do: []
  def children(state, _), do: state

  def update(state, props) do
    props = Enum.into(props, %{})
    Map.merge(state, props)
  end

  def handle(state, _event), do: {state, nil}

  def render(%{visible: false}, canvas), do: canvas

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
