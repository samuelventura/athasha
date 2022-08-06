defmodule AthashaTerminal.Button do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    width = Keyword.fetch!(opts, :width)
    text = Keyword.fetch!(opts, :text)
    focus = Keyword.get(opts, :focus, false)
    enabled = Keyword.get(opts, :enabled, true)
    origin = Keyword.get(opts, :origin, {0, 0})

    state = %{
      focus: focus,
      enabled: enabled,
      width: width,
      text: text,
      origin: origin
    }

    {state, nil}
  end

  def update(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:enabled, enabled}) do
    state = %{state | enabled: enabled}
    {state, nil}
  end

  def update(state, {:key, _, "\t"}) do
    {state, {:focus, :next}}
  end

  def update(%{enabled: true, text: text} = state, {:key, _, "\r"}) do
    {state, {:click, text}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      text: text,
      focus: focus,
      width: width,
      enabled: enabled,
      origin: {orig_x, orig_y}
    } = state

    canvas =
      case {enabled, focus} do
        {false, _} ->
          canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_disabled))
          Canvas.color(canvas, :bgcolor, App.theme(:back_disabled))

        {true, true} ->
          canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_focused))
          Canvas.color(canvas, :bgcolor, App.theme(:back_focused))

        _ ->
          canvas = Canvas.color(canvas, :fgcolor, App.theme(:fore_data))
          Canvas.color(canvas, :bgcolor, App.theme(:back_data))
      end

    canvas = Canvas.move(canvas, orig_x, orig_y)
    canvas = Canvas.write(canvas, "[")
    canvas = Canvas.write(canvas, String.duplicate(" ", width - 2))
    canvas = Canvas.write(canvas, "]")
    offset = div(width - String.length(text), 2)
    canvas = Canvas.move(canvas, orig_x + offset, orig_y)
    Canvas.write(canvas, text)
  end
end
