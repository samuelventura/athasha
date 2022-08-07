defmodule AthashaTerminal.VintageMain do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.VintageWin

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    origin = Keyword.get(opts, :origin, {0, 0})

    state = VintageWin.init(size: size, origin: origin)

    {state, []}
  end

  def update(state, _event), do: {state, []}

  def render(state, canvas) do
    VintageWin.render(state, canvas)
  end

  def execute(_cmd), do: nil
end
