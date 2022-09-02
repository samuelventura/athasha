defmodule Terminal.React do
  alias Terminal.State

  defmacro markup(module, props) do
    quote bind_quoted: [module: module, props: props] do
      {module, props}
    end
  end

  defmacro markup(module, function, props) when is_atom(function) do
    quote bind_quoted: [module: module, function: function, props: props] do
      {{module, function}, props}
    end
  end

  defmacro markup(module, props, do: inner) when is_list(props) do
    inner = inner_to_list(inner)

    quote do
      {unquote(module), unquote(props), unquote(inner)}
    end
  end

  defmacro markup(module, function, props, do: inner) do
    inner = inner_to_list(inner)

    quote do
      {{unquote(module), unquote(function)}, unquote(props), unquote(inner)}
    end
  end

  def use_state(react, initial) do
    key = State.next(react)
    current = State.get(react, key, initial)
    {current, fn value -> State.put(react, key, value) end}
  end

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
    {module, state, inner} =
      case markup do
        {module, opts, inner} ->
          state = module.init(opts ++ extras)
          {module, state, inner}

        {module, opts} ->
          state = module.init(opts ++ extras)
          {module, state, []}
      end

    state =
      for item <- inner, reduce: state do
        state ->
          {state, _} = module.append(state, realize(react, item))
          state
      end

    {module, state}
  end

  defp inner_to_list(inner) do
    list =
      case inner do
        {_, _, list} -> list
      end

    for item <- list do
      quote do
        unquote(item)
      end
    end
  end
end
