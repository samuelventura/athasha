defmodule AthashaTerminal.App do
  @callback app_init(opts :: any()) :: {any(), any()}
  @callback app_handle(state :: any(), event :: any()) :: {any(), any()}
  @callback app_render(state :: any(), canvas :: any()) :: any()
  @callback app_execute(cmd :: any()) :: any()
end
