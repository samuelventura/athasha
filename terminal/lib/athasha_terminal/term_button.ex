defmodule AthashaTerminal.Button do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    size = Keyword.get(opts, :size, {String.length(text) + 2, 1})
    focused = Keyword.get(opts, :focused, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})
    theme = Keyword.get(opts, :theme, :default)
    findex = Keyword.get(opts, :findex, 0)

    %{
      focused: focused,
      enabled: enabled,
      findex: findex,
      theme: theme,
      size: size,
      text: text,
      origin: origin
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(%{findex: findex, enabled: enabled}, :focusable, _), do: findex >= 0 && enabled
  def select(state, name, value), do: Map.get(state, name, value)

  def handle(state, {:key, _, "\t"}) do
    {state, {:focused, :next}}
  end

  def handle(%{enabled: true, text: text} = state, {:key, _, "\r"}) do
    {state, {:click, text}}
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      text: text,
      theme: theme,
      focused: focused,
      size: {width, _},
      enabled: enabled
    } = state

    theme = Theme.get(theme)

    canvas =
      case {enabled, focused} do
        {false, _} ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_disabled)
          Canvas.color(canvas, :bgcolor, theme.back_disabled)

        {true, true} ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_focused)
          Canvas.color(canvas, :bgcolor, theme.back_focused)

        _ ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_editable)
          Canvas.color(canvas, :bgcolor, theme.back_editable)
      end

    canvas = Canvas.move(canvas, 0, 0)
    canvas = Canvas.write(canvas, "[")
    canvas = Canvas.write(canvas, String.duplicate(" ", width - 2))
    canvas = Canvas.write(canvas, "]")
    offset = div(width - String.length(text), 2)
    canvas = Canvas.move(canvas, offset, 0)
    Canvas.write(canvas, text)
  end
end
