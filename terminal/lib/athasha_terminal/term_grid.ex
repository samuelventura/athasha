defmodule AthashaTerminal.Grid do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Panel

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

  def update(state, name, value), do: Panel.update(state, name, value)
  def select(state, name, value), do: Panel.select(state, name, value)
  def handle(state, event), do: Panel.handle(state, event)
  def render(state, canvas), do: Panel.render(state, canvas)

  def append(state, module, opts \\ []) do
    %{columns: columns} = state
    {state, id} = Panel.append(state, module, opts)
    count = columns.count
    column = rem(id, count)
    row = div(id, count)
    {width, x} = Map.get(columns, column)
    state = Panel.id_update(state, id, :origin, {x, row})
    state = Panel.id_update(state, id, :size, {width, 1})
    {state, id}
  end
end
