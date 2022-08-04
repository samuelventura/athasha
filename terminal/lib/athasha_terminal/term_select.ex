defmodule AthashaTerminal.Select do
  alias AthashaTerminal.Canvas

  def init(opts) do
    items = Keyword.fetch!(opts, :items)
    size = Keyword.fetch!(opts, :size)
    origin = Keyword.get(opts, :origin, {0, 0})
    selected = Keyword.get(opts, :selected, 0)
    offset = Keyword.get(opts, :offset, 0)
    background = Keyword.get(opts, :background, :black)
    foreground = Keyword.get(opts, :foreground, :white)

    {count, items} =
      for item <- items, reduce: {0, %{}} do
        {count, map} ->
          {count + 1, Map.put(map, count, item)}
      end

    state = %{
      size: size,
      count: count,
      items: items,
      offset: offset,
      origin: origin,
      selected: selected,
      background: background,
      foreground: foreground
    }

    item = Map.get(items, selected)
    {state, {:item, item}}
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
    {state, {:nav, :next}}
  end

  def update(state, {:key, _, "\r"}) do
    %{items: items, selected: selected} = state
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      items: items,
      origin: {orig_x, orig_y},
      size: {width, height},
      selected: selected,
      offset: offset,
      background: background,
      foreground: foreground
    } = state

    canvas = Canvas.clear(canvas, :styles)
    canvas = Canvas.color(canvas, :foreground, foreground)
    canvas = Canvas.color(canvas, :background, background)

    for i <- 0..(height - 1), reduce: canvas do
      canvas ->
        canvas = Canvas.cursor(canvas, orig_x, orig_y + i)

        canvas =
          case offset + i == selected do
            false -> Canvas.reset(canvas, :inverse)
            true -> Canvas.set(canvas, :inverse)
          end

        item = Map.get(items, i + offset)
        item = String.pad_trailing(item, width)
        Canvas.write(canvas, item)
    end
  end
end
