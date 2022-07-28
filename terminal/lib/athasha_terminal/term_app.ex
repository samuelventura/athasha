defmodule AthashaTerminal.App do
  @callback init(ops :: any()) :: any()
  @callback update(state :: any(), event :: any()) :: {any(), [any()]}
  @callback render(state :: any()) :: [any()]
  @callback execute(state :: any()) :: any()
end
