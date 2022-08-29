defmodule Terminal.Grid do
  @behaviour Terminal.Window
  import Terminal.Window
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

  defdelegate update(state, name, value), to: Panel
  defdelegate select(state, name, value), to: Panel
  defdelegate handle(state, event), to: Panel
  defdelegate render(state, canvas), to: Panel

  def append(state, module, opts \\ []) do
    %{columns: columns} = state
    {state, id} = Panel.append(state, module, opts)
    count = columns.count
    column = rem(id, count)
    row = div(id, count)
    {width, x} = Map.get(columns, column)
    state = id_update(state, id, :origin, {x, row})
    state = id_update(state, id, :size, {width, 1})
    {state, id}
  end
end
