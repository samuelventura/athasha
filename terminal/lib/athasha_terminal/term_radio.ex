defmodule AthashaTerminal.Radio do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    items = Keyword.get(opts, :items, [])
    size = Keyword.get(opts, :size, {0, 0})
    focused = Keyword.get(opts, :focused, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})
    selected = Keyword.get(opts, :selected, 0)
    theme = Keyword.get(opts, :theme, :default)
    findex = Keyword.get(opts, :findex, 0)

    {count, items} =
      for item <- items, reduce: {0, %{}} do
        {count, map} ->
          {count + 1, Map.put(map, count, item)}
      end

    %{
      size: size,
      theme: theme,
      focused: focused,
      findex: findex,
      enabled: enabled,
      count: count,
      items: items,
      origin: origin,
      selected: selected
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(%{items: items, selected: selected}, :item, _), do: Map.get(items, selected)
  def select(state, name, value), do: Map.get(state, name, value)

  def handle(state, {:key, _, :arrow_right}) do
    %{items: items, count: count, selected: selected} = state
    selected = if selected < count - 1, do: selected + 1, else: selected
    state = %{state | selected: selected}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, {:key, _, :arrow_left}) do
    %{items: items, selected: selected} = state
    selected = if selected > 0, do: selected - 1, else: selected
    state = %{state | selected: selected}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, {:key, _, "\t"}) do
    {state, {:focused, :next}}
  end

  def handle(state, {:key, _, "\r"}) do
    %{items: items, selected: selected} = state
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focused: focused,
      enabled: enabled,
      theme: theme,
      count: count,
      items: items,
      selected: selected
    } = state

    theme = Theme.get(theme)

    {canvas, _} =
      for i <- 0..(count - 1), reduce: {canvas, 0} do
        {canvas, x} ->
          prefix =
            case i do
              0 -> ""
              _ -> " "
            end

          canvas = Canvas.move(canvas, x, 0)
          canvas = Canvas.clear(canvas, :colors)
          canvas = Canvas.write(canvas, prefix)

          canvas =
            case {enabled, focused, i == selected} do
              {false, _, _} ->
                canvas = Canvas.color(canvas, :fgcolor, theme.fore_disabled)
                Canvas.color(canvas, :bgcolor, theme.back_disabled)

              {true, true, true} ->
                canvas = Canvas.color(canvas, :fgcolor, theme.fore_focused)
                Canvas.color(canvas, :bgcolor, theme.back_focused)

              {true, false, true} ->
                canvas = Canvas.color(canvas, :fgcolor, theme.fore_selected)
                Canvas.color(canvas, :bgcolor, theme.back_selected)

              _ ->
                canvas = Canvas.color(canvas, :fgcolor, theme.fore_editable)
                Canvas.color(canvas, :bgcolor, theme.back_editable)
            end

          item = Map.get(items, i)
          canvas = Canvas.write(canvas, item)
          len = String.length(prefix) + String.length(item)
          {canvas, x + len}
      end

    canvas
  end
end
