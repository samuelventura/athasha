defmodule AthashaTerminal.Select do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    items = Keyword.fetch!(opts, :items)
    size = Keyword.fetch!(opts, :size)
    focus = Keyword.get(opts, :focus, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})
    selected = Keyword.get(opts, :selected, 0)
    offset = Keyword.get(opts, :offset, 0)

    {count, items} =
      for item <- items, reduce: {0, %{}} do
        {count, map} ->
          {count + 1, Map.put(map, count, item)}
      end

    state = %{
      size: size,
      focus: focus,
      enabled: enabled,
      count: count,
      items: items,
      offset: offset,
      origin: origin,
      selected: selected
    }

    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:key, _, :arrow_down}) do
    %{items: items, count: count, size: {_, height}, selected: selected, offset: offset} = state
    selected = if selected < count - 1, do: selected + 1, else: selected
    offset = if selected < offset + height, do: offset, else: 1 + selected - height
    state = %{state | selected: selected, offset: offset}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, {:key, _, :arrow_up}) do
    %{items: items, selected: selected, offset: offset} = state
    selected = if selected > 0, do: selected - 1, else: selected
    offset = if selected < offset, do: selected, else: offset
    state = %{state | selected: selected, offset: offset}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, {:key, _, "\t"}) do
    {state, {:focus, :next}}
  end

  def update(state, {:key, _, "\r"}) do
    %{items: items, selected: selected} = state
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focus: focus,
      items: items,
      enabled: enabled,
      origin: {orig_x, orig_y},
      size: {width, height},
      selected: selected,
      offset: offset
    } = state

    for i <- 0..(height - 1), reduce: canvas do
      canvas ->
        canvas = Canvas.move(canvas, orig_x, orig_y + i)
        canvas = Canvas.clear(canvas, :colors)

        canvas =
          case {enabled, focus, i == selected} do
            {false, _, _} ->
              canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_disabled))
              Canvas.color(canvas, :bgcolor, App.theme(:back_disabled))

            {true, true, true} ->
              canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_focused))
              Canvas.color(canvas, :bgcolor, App.theme(:back_focused))

            {true, false, true} ->
              canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_selected))
              Canvas.color(canvas, :bgcolor, App.theme(:back_selected))

            _ ->
              canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_data))
              Canvas.color(canvas, :bgcolor, App.theme(:back_data))
          end

        item = Map.get(items, i + offset, "")
        item = String.pad_trailing(item, width)
        Canvas.write(canvas, item)
    end
  end
end
