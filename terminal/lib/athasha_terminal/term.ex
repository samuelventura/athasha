defmodule AthashaTerminal.Term do
  def init(term) do
    case term do
      :linux -> AthashaTerminal.TermLinux
      :code -> AthashaTerminal.TermCode
    end
  end

  defmacro __using__(_) do
    quote do
      @ctl 1
      @alt 2
      @fun 4

      @bold 1
      @dimmed 2
      @inverse 4

      @black 0
      @red 1
      @green 2
      @yellow 3
      @blue 4
      @magenta 5
      @cyan 6
      @white 7

      defp color_id(color) do
        case color do
          :black -> @black
          :red -> @red
          :green -> @green
          :yellow -> @yellow
          :blue -> @blue
          :magenta -> @magenta
          :cyan -> @cyan
          :white -> @white
          _ -> color
        end
      end
    end
  end
end
