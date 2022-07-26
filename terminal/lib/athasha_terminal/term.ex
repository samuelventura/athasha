defmodule AthashaTerminal.Term do
  def init(term) do
    case term do
      :linux -> AthashaTerminal.TermLinux
      :code -> AthashaTerminal.TermCode
    end
  end
end
