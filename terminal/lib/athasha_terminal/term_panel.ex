defmodule AthashaTerminal.Panel do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas

  def init(opts) do
    theme = Keyword.get(opts, :theme, :default)
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {0, 0})
    enabled = Keyword.get(opts, :enabled, true)
    focused = Keyword.get(opts, :focused, false)
    findex = Keyword.get(opts, :findex, 0)
    focus = Keyword.get(opts, :focus, -1)

    %{
      origin: origin,
      theme: theme,
      enabled: enabled,
      focused: focused,
      findex: findex,
      focus: focus,
      size: size,
      count: 0,
      index: []
    }
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(state, name, value), do: Map.get(state, name, value)

  # strict to catch focus handling bugs
  def handle(%{focus: focus} = state, {:key, _, _} = event) do
    mote = Map.get(state, focus)
    {mote, event} = mote_handle(mote, event)
    {Map.put(state, focus, mote), {focus, event}}
  end

  def handle(state, _event), do: {state, nil}

  def append(state, module, opts \\ []) do
    %{theme: theme, count: count} = state
    opts = opts ++ [theme: theme]
    mote = {module, module.init(opts)}
    state = Map.put(state, :count, count + 1)
    state = Map.update!(state, :index, &[count | &1])
    state = Map.put(state, count, mote)
    state = focus_update(state)
    {state, count}
  end

  def render(state, canvas) do
    for id <- Enum.reverse(state.index), reduce: canvas do
      canvas ->
        mote = Map.get(state, id)
        bounds = mote_bounds(mote)
        canvas = Canvas.push(canvas, bounds)
        canvas = mote_render(mote, canvas)
        canvas = Canvas.pop(canvas)
        canvas
    end
  end

  defp focus_update(state) do
    %{
      enabled: enabled,
      focused: focused,
      focus: focus,
      index: index
    } = state

    index = Enum.filter(index, &(id_findex(state, &1) >= 0))
    mote = Map.get(state, focus)

    case {index, mote, enabled && focused} do
      {[], nil, true} ->
        state

      {_, nil, true} ->
        [focus | _] = Enum.reverse(index)
        mote = Map.get(state, focus)
        mote = mote_update(mote, :focused, true)
        state = Map.put(state, :focus, focus)
        Map.put(state, focus, mote)

      {_, nil, false} ->
        state

      {_, _, false} ->
        mote = mote_update(mote, :focused, false)
        state = Map.put(state, :focus, -1)
        Map.put(state, focus, mote)

      _ ->
        state
    end
  end

  def id_select(state, id, name, value) do
    mote = Map.get(state, id)
    mote_select(mote, name, value)
  end

  def id_update(state, id, name, value) do
    mote = Map.get(state, id)
    mote = mote_update(mote, name, value)
    Map.put(state, id, mote)
  end

  def id_callback(state, id, param, callback) do
    mote = Map.get(state, id)
    {mote, param} = mote_callback(mote, param, callback)
    {Map.put(state, id, mote), param}
  end

  defp id_findex(state, id), do: id_select(state, id, :findex, -1)
  defp mote_bounds(mote), do: mote_select(mote, :bounds, {0, 0, 0, 0})

  defp mote_callback({module, state}, param, callback) do
    {state, param} = callback.(state, param)
    {{module, state}, param}
  end

  defp mote_handle({module, state}, event) do
    {state, event} = module.handle(state, event)
    {{module, state}, event}
  end

  defp mote_update({module, state}, name, value) do
    {module, module.update(state, name, value)}
  end

  defp mote_select({module, state}, name, value) do
    module.select(state, name, value)
  end

  defp mote_render({module, state}, canvas) do
    module.render(state, canvas)
  end
end
