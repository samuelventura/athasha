defmodule Terminal.Panel do
  @behaviour Terminal.Window
  import Terminal.Imports
  alias Terminal.Canvas

  def init(opts) do
    theme = Keyword.get(opts, :theme, :default)
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {0, 0})
    enabled = Keyword.get(opts, :enabled, true)
    focused = Keyword.get(opts, :focused, false)
    findex = Keyword.get(opts, :findex, 0)
    focus = Keyword.get(opts, :focus, -1)
    root = Keyword.get(opts, :root, false)

    %{
      root: root,
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

  def update(state, :focused, focused) do
    state = Map.put(state, :focused, focused)
    focus_update(state)
  end

  def update(state, :enabled, enabled) do
    state = Map.put(state, :enabled, enabled)
    focus_update(state)
  end

  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}

  def select(state, :focusable, _) do
    %{findex: findex, enabled: enabled, index: index} = state

    count =
      for i <- index, reduce: 0 do
        count ->
          mote = Map.get(state, i)

          case mote_select(mote, :focusable, false) do
            false -> count
            true -> count + 1
          end
      end

    findex >= 0 && enabled && count > 0
  end

  def select(state, name, value), do: Map.get(state, name, value)

  # strict to catch focus handling bugs
  def handle(%{focus: focus, root: root} = state, {:key, _, _} = event) do
    mote = Map.get(state, focus)
    {mote, event} = mote_handle(mote, event)

    case event do
      {:focus, :next} ->
        {first, next} = focus_next(state)

        next =
          case {root, next} do
            {true, nil} -> first
            _ -> next
          end

        case next do
          nil ->
            {Map.put(state, focus, mote), {:focus, :next}}

          _ ->
            mote = mote_update(mote, :focused, false)
            state = Map.put(state, focus, mote)
            mote = Map.get(state, next)
            mote = mote_update(mote, :focused, true)
            state = Map.put(state, next, mote)
            {Map.put(state, :focus, next), nil}
        end

      _ ->
        {Map.put(state, focus, mote), {focus, event}}
    end
  end

  def handle(state, _event), do: {state, nil}

  def append(%{theme: theme} = state, module, opts) do
    opts = opts ++ [theme: theme]
    mote = {module, module.init(opts)}
    append(state, mote)
  end

  def append(%{count: count} = state, mote) do
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

  defp focus_next(state) do
    %{focus: focus} = state
    index = focus_list(state)

    {next, _} =
      for i <- index, reduce: {nil, false} do
        {nil, true} ->
          {i, true}

        {next, true} ->
          {next, true}

        {_, false} ->
          case i do
            ^focus -> {nil, true}
            _ -> {nil, false}
          end
      end

    case index do
      [] -> {nil, next}
      [first | _] -> {first, next}
    end
  end

  defp focus_list(state) do
    %{index: index} = state
    index = Enum.filter(index, &id_focusable(state, &1))
    index = Enum.reverse(index)
    Enum.sort(index, &focus_compare(state, &1, &2))
  end

  defp focus_compare(state, i1, i2) do
    fi1 = id_select(state, i1, :findex, -1)
    fi2 = id_select(state, i2, :findex, -1)
    fi1 <= fi2
  end

  defp focus_update(state) do
    %{
      enabled: enabled,
      focused: focused,
      focus: focus
    } = state

    index = focus_list(state)
    mote = Map.get(state, focus)

    case {index, mote, enabled && focused} do
      {[], nil, true} ->
        state

      {_, nil, true} ->
        [focus | _] = index
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
end
