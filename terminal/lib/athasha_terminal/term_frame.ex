defmodule AthashaTerminal.Frame do
  alias AthashaTerminal.Canvas

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    focus = Keyword.fetch!(opts, :focus)
    title = Keyword.fetch!(opts, :title)
    origin = Keyword.get(opts, :origin, {0, 0})
    background = Keyword.get(opts, :background, :black)
    foreground = Keyword.get(opts, :foreground, :white)

    state = %{
      size: size,
      focus: focus,
      title: title,
      origin: origin,
      background: background,
      foreground: foreground
    }

    {state, nil}
  end

  def update(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focus: focus,
      origin: {orig_x, orig_y},
      size: {width, height},
      title: title,
      background: background,
      foreground: foreground
    } = state

    canvas = Canvas.clear(canvas, :styles)
    canvas = Canvas.color(canvas, :background, background)
    canvas = Canvas.color(canvas, :foreground, foreground)
    last = height - 1

    canvas =
      for r <- 0..last, reduce: canvas do
        canvas ->
          canvas = Canvas.move(canvas, orig_x, orig_y + r)
          horizontal = border_char(focus, :horizontal)
          vertical = border_char(focus, :vertical)

          border =
            case r do
              0 ->
                [
                  border_char(focus, :top_left),
                  String.duplicate(horizontal, width - 2),
                  border_char(focus, :top_right)
                ]

              ^last ->
                [
                  border_char(focus, :bottom_left),
                  String.duplicate(horizontal, width - 2),
                  border_char(focus, :bottom_right)
                ]

              _ ->
                [vertical, String.duplicate(" ", width - 2), vertical]
            end

          Canvas.write(canvas, border)
      end

    canvas = Canvas.move(canvas, orig_x + 1, orig_y)
    Canvas.write(canvas, title)
  end

  # https://en.wikipedia.org/wiki/Box-drawing_character
  defp border_char(focus, elem) do
    case focus do
      false ->
        case elem do
          :top_left -> "┌"
          :top_right -> "┐"
          :bottom_left -> "└"
          :bottom_right -> "┘"
          :horizontal -> "─"
          :vertical -> "│"
        end

      true ->
        case elem do
          :top_left -> "╔"
          :top_right -> "╗"
          :bottom_left -> "╚"
          :bottom_right -> "╝"
          :horizontal -> "═"
          :vertical -> "║"
        end

      _ ->
        " "
    end
  end
end
