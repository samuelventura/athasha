defmodule AthashaTerminal.Term do
  @patterns [
    resize: ~r/^\e\[(\d+);(\d+)R/,
    mouse: ~r/^\e\[M(.)(.)(.)/,
    mouse_down: ~r/^\e\[<(\d+);(\d+);(\d+)M/,
    mouse_up: ~r/^\e\[<(\d+);(\d+);(\d+)m/,
    escape: ~r/^(\e)/,
    key: ~r/^(.)/
  ]

  def append(state, data) do
    state = state <> data
    scan(@patterns, state, [])
  end

  def match(regex, data) do
    case Regex.run(regex, data) do
      nil ->
        {data, nil}

      [match | captures] ->
        dl = String.length(data)
        ml = String.length(match)
        tail = String.slice(data, ml, dl)
        {tail, captures}
    end
  end

  defp scan(_, "", events), do: {"", Enum.reverse(events)}
  defp scan([], state, events), do: scan(@patterns, state, events)

  defp scan([{name, pattern} | ptail], state, events) do
    case match(pattern, state) do
      {state, nil} ->
        scan(ptail, state, events)

      {stail, params} ->
        params = captures(name, params)
        event = {name, params}
        scan(@patterns, stail, [event | events])
    end
  end

  defp captures(:resize, [h, w]) do
    {String.to_integer(w), String.to_integer(h)}
  end

  defp captures(:mouse, [s, x, y]) do
    [s] = String.to_charlist(s)
    [x] = String.to_charlist(x)
    [y] = String.to_charlist(y)
    {s - 32, x - 32, y - 32}
  end

  defp captures(:mouse_down, [b, x, y]) do
    {String.to_integer(b), String.to_integer(x), String.to_integer(y)}
  end

  defp captures(:mouse_up, [b, x, y]) do
    {String.to_integer(b), String.to_integer(x), String.to_integer(y)}
  end

  defp captures(:escape, [all]) do
    all
  end

  defp captures(:key, [all]) do
    all
  end
end
