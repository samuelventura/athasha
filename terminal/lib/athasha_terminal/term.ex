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
  def cursor(term, line, column), do: init(term).cursor(line, column)
  def mouse(term, target), do: init(term).mouse(target)
  def show(term, target), do: init(term).show(target)
  def hide(term, target), do: init(term).hide(target)
  def color(term, target, id), do: init(term).color(target, id)
  def set(term, target), do: init(term).set(target)
  def reset(term, target), do: init(term).reset(target)
end
