defmodule AthashaTerminal.Radio do
  alias AthashaTerminal.Canvas

  def init(opts) do
    items = Keyword.fetch!(opts, :items)
    focus = Keyword.get(opts, :focus, false)
    origin = Keyword.get(opts, :origin, {0, 0})
    selected = Keyword.get(opts, :selected, 0)
    background = Keyword.get(opts, :background, :black)
    foreground = Keyword.get(opts, :foreground, :white)

    {count, items} =
      for item <- items, reduce: {0, %{}} do
        {count, map} ->
          {count + 1, Map.put(map, count, item)}
      end

    state = %{
      focus: focus,
      items: items,
      count: count,
      origin: origin,
      selected: selected,
      background: background,
      foreground: foreground
    }

    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:selected, selected}) do
    state = %{state | selected: selected}
    {state, nil}
  end

  def update(state, {:key, _, :arrow_right}) do
    %{items: items, count: count, selected: selected} = state
    selected = if selected < count - 1, do: selected + 1, else: selected
    state = %{state | selected: selected}
    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def update(state, {:key, _, :arrow_left}) do
    %{items: items, selected: selected} = state
    selected = if selected > 0, do: selected - 1, else: selected
    state = %{state | selected: selected}
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
      focus: focus,
      count: count,
      items: items,
      origin: {orig_x, orig_y},
      selected: selected,
      background: background,
      foreground: foreground
    } = state

    canvas = Canvas.clear(canvas, :styles)
    canvas = Canvas.color(canvas, :foreground, foreground)
    canvas = Canvas.color(canvas, :background, background)

    {canvas, _} =
      for i <- 0..(count - 1), reduce: {canvas, 0} do
        {canvas, x} ->
          prefix =
            case i do
              0 -> ""
              _ -> " "
            end

          canvas = Canvas.move(canvas, orig_x + x, orig_y)
          canvas = Canvas.reset(canvas, :inverse)
          canvas = Canvas.reset(canvas, :normal)
          canvas = Canvas.write(canvas, prefix)

          canvas =
            case {focus, i == selected} do
              {true, true} -> Canvas.set(canvas, :inverse)
              {false, true} -> Canvas.set(canvas, :bold)
              _ -> canvas
            end

          item = Map.get(items, i)
          canvas = Canvas.write(canvas, item)
          len = String.length(prefix) + String.length(item)
          {canvas, x + len}
      end

    canvas
  end
end
