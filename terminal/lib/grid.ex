defmodule Terminal.Grid do
  @behaviour Terminal.Window
  @behaviour Terminal.Container
  alias Terminal.Panel

  def init(opts) do
    columns = Keyword.fetch!(opts, :columns)
    state = Panel.init(opts)

    {count, _, columns} =
      for c <- columns, reduce: {0, 0, %{}} do
        {i, s, map} ->
          {i + 1, s + c, Map.put(map, i, {c, s})}
      end

    columns = Map.put(columns, :count, count)
    Map.put(state, :columns, columns)
  end

  defdelegate count(state), to: Panel
  defdelegate bounds(state), to: Panel
  defdelegate bounds(state, rect), to: Panel
  defdelegate focusable(state), to: Panel
  defdelegate focused(state, focused), to: Panel
  defdelegate findex(state), to: Panel

  defdelegate handle(state, event), to: Panel
  defdelegate render(state, canvas), to: Panel

  def append(%{columns: columns} = state, mote) do
    id = Panel.count(state) + 1
    count = columns.count
    column = rem(id, count)
    row = div(id, count)
    {width, x} = Map.get(columns, column)
    mote = mote_bounds(mote, {x, row, width, 1})
    Panel.append(state, mote)
  end

  defp mote_bounds({module, state}, rect), do: module.bounds(state, rect)
end
