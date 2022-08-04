defmodule AthashaTerminal.AppNav do
  def next(curr, list) do
    {len, index, map} = build(curr, list)

    case index do
      nil -> Map.get(map, 0)
      _ -> Map.get(map, rem(index + 1, len))
    end
  end

  defp build(curr, list) do
    initial = {0, nil, %{}}

    Enum.reduce(list, initial, fn item, accum ->
      {len, index, map} = accum
      map = Map.put(map, len, item)

      index =
        case item == curr do
          true -> len
          _ -> index
        end

      {len + 1, index, map}
    end)
  end
end
