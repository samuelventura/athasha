defmodule AthashaTerminal.Window do
  @callback init(opts :: any()) :: any()
  @callback update(state :: any(), name :: any(), value :: any()) :: any()
  @callback select(state :: any(), name :: any(), value :: any()) :: any()
  @callback handle(state :: any(), event :: any()) :: {any(), any()}
  @callback render(state :: any(), canvas :: any()) :: any()
end
