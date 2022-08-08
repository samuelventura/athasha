defmodule AthashaTerminal.Radio do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    items = Keyword.fetch!(opts, :items)
    focus = Keyword.get(opts, :focus, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})
    selected = Keyword.get(opts, :selected, 0)

    {count, items} =
      for item <- items, reduce: {0, %{}} do
        {count, map} ->
          {count + 1, Map.put(map, count, item)}
      end

    state = %{
      focus: focus,
      enabled: enabled,
      items: items,
      count: count,
      origin: origin,
      selected: selected
    }

    item = Map.get(items, selected)
    {state, {:item, item}}
  end

  def handle(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def handle(state, {:selected, selected}) do
    state = %{state | selected: selected}
    {state, nil}
  end

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
      focus: focus,
      enabled: enabled,
      count: count,
      items: items,
      origin: {orig_x, orig_y},
      selected: selected
    } = state

    {canvas, _} =
      for i <- 0..(count - 1), reduce: {canvas, 0} do
        {canvas, x} ->
          prefix =
            case i do
              0 -> ""
              _ -> " "
            end

          canvas = Canvas.move(canvas, orig_x + x, orig_y)
          canvas = Canvas.clear(canvas, :colors)
          canvas = Canvas.write(canvas, prefix)

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

          item = Map.get(items, i)
          canvas = Canvas.write(canvas, item)
          len = String.length(prefix) + String.length(item)
          {canvas, x + len}
      end

    canvas
  end
end
