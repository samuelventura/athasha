defmodule AthashaTerminal.Term do
  alias AthashaTerminal.TermLinux
  alias AthashaTerminal.TermCode

  def append(term, buffer, data) do
    case term do
      :linux -> TermLinux.append(buffer, data)
      :code -> TermCode.append(buffer, data)
    end
  end
end
