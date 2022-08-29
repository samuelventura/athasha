defmodule Terminal.App do
  @callback init(opts :: any()) :: {any(), any()}
  @callback handle(state :: any(), event :: any()) :: {any(), any()}
  @callback render(state :: any(), canvas :: any()) :: any()
  @callback execute(cmd :: any()) :: any()

  def init({module, opts}, extras \\ []) do
    {state, cmd} = module.init(opts ++ extras)
    {{module, state}, cmd}
  end

  def handle({module, state}, event) do
    {state, cmd} = module.handle(state, event)
    {{module, state}, cmd}
  end

  def render({module, state}, canvas) do
    module.render(state, canvas)
  end

  def execute({module, _state}, cmd) do
    module.execute(cmd)
  end
end
