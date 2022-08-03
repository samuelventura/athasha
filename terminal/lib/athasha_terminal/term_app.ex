defmodule AthashaTerminal.App do
  @callback init(opts :: any()) :: {any(), [any()]}
  @callback update(state :: any(), event :: any()) :: {any(), [any()]}
  @callback render(state :: any(), opts :: Keyword.t()) :: [any()]
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

  def render(mote, opts) do
    {module, state} = mote
    module.render(state, opts)
  end

  def execute(mote, cmd) do
    {module, _state} = mote
    module.execute(cmd)
  end

  def kupdate(map, key, event) do
    mote = Map.get(map, key)
    {mote, events} = update(mote, event)
    map = Map.put(map, key, mote)
    {map, events}
  end
end
