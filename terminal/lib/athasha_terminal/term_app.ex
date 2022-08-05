defmodule AthashaTerminal.App do
  @callback init(opts :: any()) :: {any(), [any()]}
  @callback update(state :: any(), event :: any()) :: {any(), [any()]}
  @callback render(state :: any(), canvas :: any()) :: any()
  @callback execute(cmd :: any()) :: any()

  def init(module, opts) do
    {state, events} = module.init(opts)
    {{module, state}, events}
  end

  def update(mote, event) do
    {module, state} = mote
    {state, events} = module.update(state, event)
    {{module, state}, events}
  end

  def render(mote, canvas) do
    {module, state} = mote
    module.render(state, canvas)
  end

  def execute(mote, cmd) do
    {module, _state} = mote
    module.execute(cmd)
  end

  def get(mote, field, defval \\ nil) do
    {module, state} = mote
    module.get(state, field, defval)
  end

  def kupdate(map, key, event) do
    mote = Map.get(map, key)
    {mote, events} = update(mote, event)
    map = Map.put(map, key, mote)
    {map, events}
  end

  def kget(map, key, field, defval \\ nil) do
    mote = Map.get(map, key)
    get(mote, field, defval)
  end
end
