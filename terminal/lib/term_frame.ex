defmodule AthashaTerminal.Frame do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    size = Keyword.get(opts, :size, {0, 0})
    title = Keyword.get(opts, :title, "")
    style = Keyword.get(opts, :style, :single)
    bracket = Keyword.get(opts, :bracket, false)
    origin = Keyword.get(opts, :origin, {0, 0})
    theme = Keyword.get(opts, :theme, :default)
    theme = Theme.get(theme)
    bgcolor = Keyword.get(opts, :bgcolor, theme.back_readonly)
    fgcolor = Keyword.get(opts, :fgcolor, theme.fore_readonly)

    %{
      size: size,
      style: style,
      bracket: bracket,
      title: title,
      origin: origin,
      bgcolor: bgcolor,
      fgcolor: fgcolor
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(state, name, value), do: Map.get(state, name, value)
  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      bracket: bracket,
      style: style,
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
          canvas = Canvas.move(canvas, 0, r)
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

    canvas = Canvas.move(canvas, 1, 0)

    title =
      case bracket do
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
