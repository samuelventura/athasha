defmodule AthashaTerminal.Input do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    width = Keyword.fetch!(opts, :width)
    text = Keyword.get(opts, :text, "")
    focus = Keyword.get(opts, :focus, false)
    enabled = Keyword.get(opts, :enabled, false)
    cursor = Keyword.get(opts, :cursor, String.length(text))
    origin = Keyword.get(opts, :origin, {0, 0})

    state = %{
      focus: focus,
      cursor: cursor,
      enabled: enabled,
      text: text,
      width: width,
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

  def update(state, {:text, text}) do
    state = %{state | text: text, cursor: String.length(text)}
    {state, nil}
  end

  def update(state, {:key, _, "\t"}) do
    {state, {:nav, :next}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focus: focus,
      cursor: cursor,
      enabled: enabled,
      origin: {orig_x, orig_y},
      width: width,
      text: text
    } = state

    canvas = Canvas.clear(canvas, :colors)

    canvas =
      case {focus, enabled} do
        {true, true} ->
          canvas = Canvas.color(canvas, :foreground, App.theme(:fore_focused))
          Canvas.color(canvas, :background, App.theme(:back_focused))

        {_, false} ->
          canvas = Canvas.color(canvas, :foreground, App.theme(:fore_disabled))
          Canvas.color(canvas, :background, App.theme(:back_disabled))

        _ ->
          canvas = Canvas.color(canvas, :foreground, App.theme(:fore_data))
          Canvas.color(canvas, :background, App.theme(:back_data))
      end

    canvas = Canvas.move(canvas, orig_x, orig_y)
    text = String.pad_trailing(text, width)
    canvas = Canvas.write(canvas, text)

    case {focus, enabled} do
      {true, true} ->
        Canvas.cursor(canvas, orig_x + cursor, orig_y)

      _ ->
        canvas
    end
  end

  def get(state, field, defval \\ nil) do
    Map.get(state, field, defval)
  end
end
