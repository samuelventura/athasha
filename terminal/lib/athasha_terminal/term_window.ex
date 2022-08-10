defmodule AthashaTerminal.Window do
  @callback init(opts :: any()) :: any()
  @callback update(state :: any(), name :: any(), value :: any()) :: any()
  @callback select(state :: any(), name :: any(), value :: any()) :: any()
  @callback handle(state :: any(), event :: any()) :: {any(), any()}
  @callback render(state :: any(), canvas :: any()) :: any()

  def id_focusable(state, id), do: id_select(state, id, :focusable, false)

  def mote_bounds(mote), do: mote_select(mote, :bounds, {0, 0, 0, 0})

  def id_select(state, id, name, value \\ nil) do
    mote = Map.get(state, id)
    mote_select(mote, name, value)
  end

  def id_update(state, id, name, value) do
    mote = Map.get(state, id)
    mote = mote_update(mote, name, value)
    Map.put(state, id, mote)
  end

  def id_updates(state, id, opts) do
    mote = Map.get(state, id)

    mote =
      for {name, value} <- opts, reduce: mote do
        mote ->
          mote_update(mote, name, value)
      end

    Map.put(state, id, mote)
  end

  def id_callback(state, id, param, callback) do
    mote = Map.get(state, id)
    {mote, param} = mote_callback(mote, param, callback)
    {Map.put(state, id, mote), param}
  end

  def mote_callback({module, state}, param, callback) do
    {state, param} = callback.(state, param)
    {{module, state}, param}
  end

  def mote_handle({module, state}, event) do
    {state, event} = module.handle(state, event)
    {{module, state}, event}
  end

  def mote_update({module, state}, name, value) do
    {module, module.update(state, name, value)}
  end

  def mote_select({module, state}, name, value \\ nil) do
    module.select(state, name, value)
  end

  def mote_render({module, state}, canvas) do
    module.render(state, canvas)
  end
end
