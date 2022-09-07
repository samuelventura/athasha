defmodule Terminal.Select do
  @behaviour Terminal.Window
  alias Terminal.Canvas
  alias Terminal.Theme

  def init(opts) do
    items = Keyword.get(opts, :items, [])
    size = Keyword.get(opts, :size, {0, 0})
    visible = Keyword.get(opts, :visible, true)
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
      focused: focused,
      count: count,
      items: items,
      offset: offset,
      size: size,
      theme: theme,
      visible: visible,
      findex: findex,
      enabled: enabled,
      origin: origin,
      selected: selected
    }
  end

  def bounds(%{origin: {x, y}, size: {w, h}}), do: {x, y, w, h}
  def focusable(%{enabled: false}), do: false
  def focusable(%{visible: false}), do: false
  def focusable(%{findex: findex}), do: findex >= 0
  def focused(%{focused: focused}), do: focused
  def focused(state, focused), do: Map.put(state, :focused, focused)
  def findex(%{findex: findex}), do: findex
  def children(_state), do: []
  def children(state, _), do: state

  def update(state, props) do
    props = Enum.into(props, %{})
    props = Map.drop(props, [:focused, :count, :items, :offset])
    Map.merge(state, props)
  end

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

  def render(%{visible: false}, canvas), do: canvas

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
