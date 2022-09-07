defmodule Terminal.Reapp do
  alias Terminal.State
  alias Terminal.Reapp

  defmacro __using__(_opts) do
    quote do
      @behaviour Terminal.App
      import Terminal.React
      import Terminal.Reapp, only: [app_init: 2]
      defdelegate handle(state, event), to: Reapp
      defdelegate render(state, canvas), to: Reapp
      defdelegate execute(cmd), to: Reapp
    end
  end

  defdelegate app_init(function, props), to: Reapp, as: :init

  def init(func, opts) do
    opts = Enum.into(opts, %{})
    react = State.init()
    markup = func.(react, opts)
    {key, mote} = realize(react, markup, %{}, focused: true, root: true)
    state = %{func: func, opts: opts, key: key, mote: mote, react: react}
    {state, nil}
  end

  def handle(%{func: func, opts: opts, key: key, mote: mote, react: react}, event) do
    {mote, _} = mote_handle(mote, event)
    current = mote_to_map(mote, [key], %{})
    State.reset(react)
    markup = func.(react, opts)
    {key, mote} = realize(react, markup, current, focused: true, root: true)
    state = %{func: func, opts: opts, key: key, mote: mote, react: react}
    {state, nil}
  end

  def render(%{mote: {module, substate}}, canvas), do: module.render(substate, canvas)
  def execute(_cmd), do: nil

  defp mote_to_map({module, state}, keys, map) do
    map =
      for {key, mote} <- module.children(state), reduce: map do
        map -> mote_to_map(mote, [key | keys], map)
      end

    Map.put(map, keys, {module, state})
  end

  defp mote_handle({module, state}, event) do
    {state, cmd} = module.handle(state, event)
    {{module, state}, cmd}
  end

  defp realize(react, markup, current, extras \\ []) do
    {key, module, opts, inner} = markup
    keys = State.push(react, key)
    inner = for item <- inner, do: realize(react, item, current)
    State.pop(react)

    state =
      case Map.get(current, keys) do
        {^module, state} ->
          module.update(state, opts)

        _ ->
          module.init(opts ++ extras)
      end

    state = module.children(state, inner)
    {key, {module, state}}
  end
end
