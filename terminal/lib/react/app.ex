defmodule Terminal.React.App do
  alias Terminal.State
  alias Terminal.React

  defmacro __using__(_opts) do
    quote do
      @behaviour Terminal.App
      import Terminal.React
      import Terminal.React.App, only: [app_init: 2]
      defdelegate handle(state, event), to: React.App
      defdelegate render(state, canvas), to: React.App
      defdelegate execute(cmd), to: React.App
    end
  end

  defdelegate app_init(function, props), to: React.App, as: :init

  def init(func, opts) do
    opts = Enum.into(opts, %{})
    react = State.init()
    markup = func.(react, opts)
    mote = realize(react, markup, focused: true, root: true)
    state = %{func: func, opts: opts, mote: mote, react: react}
    {state, nil}
  end

  def handle(%{func: func, opts: opts, mote: mote, react: react}, event) do
    mote_handle(mote, event)
    State.reset(react)
    markup = func.(react, opts)
    mote = realize(react, markup, focused: true, root: true)
    state = %{func: func, opts: opts, mote: mote, react: react}
    {state, nil}
  end

  def render(%{mote: {module, substate}}, canvas), do: module.render(substate, canvas)
  def execute(_cmd), do: nil

  defp mote_handle({module, state}, event) do
    {state, cmd} = module.handle(state, event)
    {{module, state}, cmd}
  end

  defp realize(react, markup, extras \\ []) do
    {key, module, opts, inner} = markup
    State.push(react, key)
    inner = for item <- inner, do: realize(react, item)
    state = module.init(opts ++ extras)

    state =
      for item <- inner, reduce: state do
        state ->
          {state, _} = module.append(state, item)
          state
      end

    State.pop(react)
    {module, state}
  end
end
