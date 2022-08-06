defmodule AthashaTerminal.Frame do
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.App

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    focus = Keyword.fetch!(opts, :focus)
    title = Keyword.fetch!(opts, :title)
    style = Keyword.get(opts, :style, :single)
    origin = Keyword.get(opts, :origin, {0, 0})
    bgcolor = Keyword.get(opts, :bgcolor, App.theme(:back))
    fgcolor = Keyword.get(opts, :fgcolor, App.theme(:fore))

    state = %{
      size: size,
      style: style,
      focus: focus,
      title: title,
      origin: origin,
      bgcolor: bgcolor,
      fgcolor: fgcolor
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
      style: style,
      origin: {orig_x, orig_y},
      size: {width, height},
      title: title,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    } = state

    canvas = Canvas.clear(canvas, :colors)
    canvas = Canvas.color(canvas, :bgcolor, bgcolor)
    canvas = Canvas.color(canvas, :fgcolor, fgcolor)
    last = height - 1

    canvas =
      for r <- 0..last, reduce: canvas do
        canvas ->
          canvas = Canvas.move(canvas, orig_x, orig_y + r)
          horizontal = border_char(style, :horizontal)
          vertical = border_char(style, :vertical)

          border =
            case r do
              0 ->
                [
                  border_char(style, :top_left),
                  String.duplicate(horizontal, width - 2),
                  border_char(style, :top_right)
                ]

              ^last ->
                [
                  border_char(style, :bottom_left),
                  String.duplicate(horizontal, width - 2),
                  border_char(style, :bottom_right)
                ]

              _ ->
                [vertical, String.duplicate(" ", width - 2), vertical]
            end

          Canvas.write(canvas, border)
      end

    canvas = Canvas.move(canvas, orig_x + 1, orig_y)

    title =
      case focus do
        true -> "[#{title}]"
        false -> " #{title} "
      end

    Canvas.write(canvas, title)
  end

  # https://en.wikipedia.org/wiki/Box-drawing_character
  defp border_char(style, elem) do
    case style do
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

      _ ->
        " "
    end
  end
end
