defmodule AthashaTerminal.Window do
  @callback init(opts :: any()) :: {any(), [any()]}
  @callback bounds(state :: any()) :: {integer(), integer(), integer(), integer()}
  @callback render(state :: any(), canvas :: any()) :: any()
end
