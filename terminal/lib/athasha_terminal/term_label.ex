defmodule AthashaTerminal.Label do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    width = Keyword.fetch!(opts, :width)
    text = Keyword.fetch!(opts, :text)
    origin = Keyword.get(opts, :origin, {0, 0})
    background = Keyword.get(opts, :background, App.theme(:back))
    foreground = Keyword.get(opts, :foreground, App.theme(:fore))

    state = %{
      width: width,
      text: text,
      origin: origin,
      background: background,
      foreground: foreground
    }

    {state, nil}
  end

  def update(state, {:text, text}) do
    state = %{state | text: text}
    {state, nil}
  end

  def update(state, {:foreground, foreground}) do
    state = %{state | foreground: foreground}
    {state, nil}
  end

  def update(state, {:background, background}) do
    state = %{state | background: background}
    {state, nil}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      origin: {orig_x, orig_y},
      width: width,
      text: text,
      background: background,
      foreground: foreground
    } = state

    canvas = Canvas.color(canvas, :background, background)
    canvas = Canvas.color(canvas, :foreground, foreground)
    canvas = Canvas.move(canvas, orig_x, orig_y)
    text = String.pad_trailing(text, width)
    Canvas.write(canvas, text)
  end
end
