defmodule Terminal.Button do
  @behaviour Terminal.Window
  alias Terminal.Canvas
  alias Terminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    size = Keyword.get(opts, :size, {String.length(text) + 2, 1})
    focused = Keyword.get(opts, :focused, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})
    theme = Keyword.get(opts, :theme, :default)
    findex = Keyword.get(opts, :findex, 0)
    on_click = Keyword.get(opts, :on_click, nil)

    %{
      focused: focused,
      enabled: enabled,
      findex: findex,
      theme: theme,
      size: size,
      text: text,
      origin: origin,
      on_click: on_click
    }
  end

  def bounds(%{origin: {x, y}, size: {w, h}}), do: {x, y, w, h}
  def bounds(state, {x, y, w, h}), do: state |> Map.put(:size, {w, h}) |> Map.put(:origin, {x, y})
  def focusable(%{findex: findex, enabled: enabled}), do: findex >= 0 && enabled
  def focused(state, focused), do: Map.put(state, :focused, focused)
  def findex(%{findex: findex}), do: findex

  def handle(state, {:key, _, "\t"}), do: {state, {:focus, :next}}
  def handle(%{on_click: on_click} = state, {:key, _, "\n"}), do: {state, on_click.()}
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
