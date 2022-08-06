defmodule AthashaTerminal.Label do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    width = Keyword.fetch!(opts, :width)
    text = Keyword.fetch!(opts, :text)
    origin = Keyword.get(opts, :origin, {0, 0})
    bgcolor = Keyword.get(opts, :bgcolor, App.theme(:back))
    fgcolor = Keyword.get(opts, :fgcolor, App.theme(:fore))

    state = %{
      width: width,
      text: text,
      origin: origin,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    }

    {state, nil}
  end

  def update(state, {:text, text}) do
    state = %{state | text: text}
    {state, nil}
  end

  def update(state, {:fgcolor, fgcolor}) do
    state = %{state | fgcolor: fgcolor}
    {state, nil}
  end

  def update(state, {:bgcolor, bgcolor}) do
    state = %{state | bgcolor: bgcolor}
    {state, nil}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      origin: {orig_x, orig_y},
      width: width,
      text: text,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    } = state

    canvas = Canvas.color(canvas, :bgcolor, bgcolor)
    canvas = Canvas.color(canvas, :fgcolor, fgcolor)
    canvas = Canvas.move(canvas, orig_x, orig_y)
    text = String.pad_trailing(text, width)
    Canvas.write(canvas, text)
  end
end
