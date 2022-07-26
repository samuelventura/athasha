defmodule AthashaTerminal.Render do
  alias AthashaTerminal.Canvas

  def render(canvas, %{
        type: :window,
        x: x,
        y: y,
        width: w,
        height: h,
        backcolor: backcolor,
        border: border,
        title: title
      }) do
    canvas = Canvas.clear(canvas, :styles)
    canvas = Canvas.color(canvas, :background, backcolor)

    ph = h - 1

    for r <- 0..ph, reduce: canvas do
      canvas ->
        canvas = Canvas.cursor(canvas, x, y + r)

        horizontal = border_char(border, :horizontal)
        vertical = border_char(border, :vertical)

        border =
          case r do
            0 ->
              [
                border_char(border, :top_left),
                String.duplicate(horizontal, w - 2),
                border_char(border, :top_right)
              ]

            ^ph ->
              [
                border_char(border, :bottom_left),
                String.duplicate(horizontal, w - 2),
                border_char(border, :bottom_right)
              ]

            _ ->
              [vertical, String.duplicate(" ", w - 2), vertical]
          end

        Canvas.write(canvas, border)
    end
  end

  # https://en.wikipedia.org/wiki/Box-drawing_character
  defp border_char(type, elem) do
    case type do
      :none ->
        " "

      :single ->
        case elem do
          :top_left -> "┌"
          :top_right -> "┐"
          :bottom_left -> "└"
          :bottom_right -> "┘"
          :horizontal -> "─"
          :vertical -> "│"
        end

      :double ->
        case elem do
          :top_left -> "╔"
          :top_right -> "╗"
          :bottom_left -> "╚"
          :bottom_right -> "╝"
          :horizontal -> "═"
          :vertical -> "║"
        end
    end
  end
end
