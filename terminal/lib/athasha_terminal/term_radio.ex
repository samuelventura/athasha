defmodule AthashaTerminal.Radio do
  def init(opts) do
    items = Keyword.fetch!(opts, :items)
    origin = Keyword.fetch!(opts, :origin)
    width = Keyword.fetch!(opts, :width)
    selected = Keyword.get(opts, :selected)

    state = %{
      items: items,
      origin: origin,
      width: width,
      selected: selected
    }

    {state, []}
  end

  def render(state) do
    %{width: width} = state
  end
end
