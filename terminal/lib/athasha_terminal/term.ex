defmodule AthashaTerminal.Term do
  def init(term) do
    case term do
      :linux -> AthashaTerminal.TermLinux
      :code -> AthashaTerminal.TermCode
    end
  end

  def append(term, buffer, data), do: init(term).append(buffer, data)
  def clear(term, target), do: init(term).clear(target)
  def query(term, target), do: init(term).query(target)
  # 1 indexed
  def cursor(term, line, column), do: init(term).cursor(line, column)
  def mouse(term, target), do: init(term).mouse(target)
  def show(term, target), do: init(term).show(target)
  def hide(term, target), do: init(term).hide(target)
  def color(term, target, :black), do: init(term).color(target, 0)
  def color(term, target, :red), do: init(term).color(target, 1)
  def color(term, target, :green), do: init(term).color(target, 2)
  def color(term, target, :yellow), do: init(term).color(target, 3)
  def color(term, target, :blue), do: init(term).color(target, 4)
  def color(term, target, :magenta), do: init(term).color(target, 5)
  def color(term, target, :cyan), do: init(term).color(target, 6)
  def color(term, target, :white), do: init(term).color(target, 7)
  def color(term, target, id), do: init(term).color(target, id)
  def set(term, target), do: init(term).set(target)
  def reset(term, target), do: init(term).reset(target)
end
