defmodule AthashaTerminal.Select do
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
    offset = Keyword.get(opts, :offset, 0)
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
      offset: offset,
      origin: origin,
      selected: selected
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(%{items: items, selected: selected}, :item, _), do: Map.get(items, selected)
  def select(%{findex: findex, enabled: enabled}, :focusable, _), do: findex >= 0 && enabled
  def select(state, name, value), do: Map.get(state, name, value)

  def handle(state, {:key, _, :arrow_down}) do
    %{items: items, count: count, size: {_, height}, selected: selected, offset: offset} = state
    selected = if selected < count - 1, do: selected + 1, else: selected
    offset = if selected < offset + height, do: offset, else: 1 + selected - height
    state = %{state | selected: selected, offset: offset}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, {:key, _, :arrow_up}) do
    %{items: items, selected: selected, offset: offset} = state
    selected = if selected > 0, do: selected - 1, else: selected
    offset = if selected < offset, do: selected, else: offset
    state = %{state | selected: selected, offset: offset}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, {:key, _, "\t"}) do
    {state, {:focus, :next}}
  end

  def handle(state, {:key, _, "\r"}) do
    %{items: items, selected: selected} = state
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      items: items,
      theme: theme,
      enabled: enabled,
      size: {width, height},
      focused: focused,
      selected: selected,
      offset: offset
    } = state

    theme = Theme.get(theme)

    for i <- 0..(height - 1), reduce: canvas do
      canvas ->
        canvas = Canvas.move(canvas, 0, i)
        canvas = Canvas.clear(canvas, :colors)

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

        item = Map.get(items, i + offset, "")
        item = String.pad_trailing(item, width)
        Canvas.write(canvas, item)
    end
  end
end
