defmodule AthashaTerminal.Input do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    size = Keyword.get(opts, :size, {String.length(text), 1})
    focused = Keyword.get(opts, :focused, false)
    enabled = Keyword.get(opts, :enabled, true)
    theme = Keyword.get(opts, :theme, :default)
    cursor = Keyword.get(opts, :cursor, String.length(text))
    origin = Keyword.get(opts, :origin, {0, 0})

    %{
      focused: focused,
      cursor: cursor,
      enabled: enabled,
      theme: theme,
      text: text,
      size: size,
      origin: origin
    }
  end

  def update(state, :text, text), do: %{state | text: text, cursor: String.length(text)}
  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(state, name, value), do: Map.get(state, name, value)

  def handle(state, {:key, _, "\t"}) do
    {state, {:focus, :next}}
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focused: focused,
      theme: theme,
      cursor: cursor,
      enabled: enabled,
      size: {width, _},
      text: text
    } = state

    theme = Theme.get(theme)
    canvas = Canvas.clear(canvas, :colors)

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
    text = String.pad_trailing(text, width)
    canvas = Canvas.write(canvas, text)

    case {focused, enabled} do
      {true, true} ->
        Canvas.cursor(canvas, 0 + cursor, 0)

      _ ->
        canvas
    end
  end
end
