defmodule AthashaTerminal.Panel do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    theme = Keyword.get(opts, :theme, Theme.get())
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {0, 0})
    enabled = Keyword.get(opts, :enabled, true)
    visible = Keyword.get(opts, :visible, true)
    focused = Keyword.get(opts, :focused, false)
    findex = Keyword.get(opts, :findex, 0)
    sindex = Keyword.get(opts, :sindex, 0)

    %{
      origin: origin,
      theme: theme,
      enabled: enabled,
      visible: visible,
      focused: focused,
      findex: findex,
      sindex: sindex,
      size: size,
      count: 0,
      index: []
    }
  end

  def bounds(%{origin: {x, y}, size: {w, h}}), do: {x, y, w, h}

  def add(state, module, opts) do
    %{theme: theme} = state
    opts = opts ++ [theme: theme]
    mote = {module, module.init(opts)}
    {id, state} = Map.get_and_update!(state, :count, &{&1, &1 + 1})
    state = Map.update!(state, :index, &[id | &1])
    state = Map.put(state, id, mote)
    {state, id}
  end

  def select(state, name), do: Map.get(state, name)

  def update(state, _name, _value), do: state

  def render(state, canvas) do
    for id <- Enum.reverse(state.index), reduce: canvas do
      canvas ->
        mote = Map.get(state, id)
        bounds = mote_bounds(mote)
        canvas = Canvas.push(canvas, bounds)
        IO.inspect(bounds)
        canvas = mote_render(mote, canvas)
        canvas = Canvas.pop(canvas)
        canvas
    end
  end

  defp mote_render({module, state}, canvas) do
    module.render(state, canvas)
  end

  defp mote_bounds({module, state}) do
    module.bounds(state)
  end
end
