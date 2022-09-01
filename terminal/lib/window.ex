defmodule Terminal.Window do
  @callback init(opts :: any()) :: state :: any()
  @callback handle(state :: any(), event :: any()) :: {state :: any(), cmd :: any()}
  @callback render(state :: any(), canvas :: any()) :: canvas :: any()
  @callback bounds(state :: any()) :: {integer(), integer(), integer(), integer()}
  @callback bounds(state :: any(), {integer(), integer(), integer(), integer()}) :: state :: any()
  @callback focused(state :: any(), true | false) :: state :: any()
  @callback focusable(state :: any()) :: true | false
  @callback findex(state :: any()) :: integer()
end

defmodule Terminal.Container do
  @callback count(state :: any()) :: integer()
  @callback append(state :: any(), {module :: atom(), child :: any()}) ::
              {state :: any(), id :: any()}
end
