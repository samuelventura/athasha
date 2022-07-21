defmodule AthashaTerminal.Term do
  alias AthashaTerminal.TermLinux

  def append(term, buffer, data) do
    case term do
      :linux -> TermLinux.append(buffer, data)
    end
  end

  @code [
    resize: ~r/^\e\[(\d+);(\d+)R/,
    mouse: ~r/^\e\[M(.)(.)(.)/,
    mouse_down: ~r/^\e\[<(\d+);(\d+);(\d+)M/,
    mouse_up: ~r/^\e\[<(\d+);(\d+);(\d+)m/,
    alt: ~r/^\e(.)/,
    esc: ~r/^\e/,
    key: ~r/^(.)/
  ]
end
