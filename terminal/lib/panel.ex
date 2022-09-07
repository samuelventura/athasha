defmodule Terminal.Panel do
  @behaviour Terminal.Window
  @behaviour Terminal.Container
  alias Terminal.Canvas

  def init(opts) do
    theme = Keyword.get(opts, :theme, :default)
    origin = Keyword.get(opts, :origin, {0, 0})
    size = Keyword.get(opts, :size, {0, 0})
    enabled = Keyword.get(opts, :enabled, true)
    focused = Keyword.get(opts, :focused, false)
    findex = Keyword.get(opts, :findex, 0)
    root = Keyword.get(opts, :root, false)

    %{
      root: root,
      origin: origin,
      theme: theme,
      enabled: enabled,
      focused: focused,
      findex: findex,
      children: %{},
      focus: nil,
      size: size,
      index: []
    }
  end

  def children(%{index: index, children: children}) do
    for id <- index, reduce: [] do
      list -> [{id, children[id]} | list]
    end
  end

  def children(state, children) do
    {index, children} =
      for {id, child} <- children, reduce: {[], %{}} do
        {index, map} ->
          {[id | index], Map.put(map, id, child)}
      end

    state = Map.put(state, :children, children)
    state = Map.put(state, :index, index)
    focus_update(state)
  end

  def update(state, props) do
    props = Enum.into(props, %{})
    Map.merge(state, props)
  end

  def bounds(%{origin: {x, y}, size: {w, h}}), do: {x, y, w, h}
  def bounds(state, {x, y, w, h}), do: state |> Map.put(:size, {w, h}) |> Map.put(:origin, {x, y})
  def focused(state, focused), do: Map.put(state, :focused, focused)
  def findex(%{findex: findex}), do: findex
  def count(_), do: 0

  def focusable(%{children: children} = state) do
    %{findex: findex, enabled: enabled, index: index} = state

    count =
      for id <- index, reduce: 0 do
        count ->
          mote = Map.get(children, id)

          case mote_focusable(mote) do
            false -> count
            true -> count + 1
          end
      end

    findex >= 0 && enabled && count > 0
  end

  def append(%{count: count, children: children} = state, mote) do
    state = Map.put(state, :count, count + 1)
    state = Map.update!(state, :index, &[count | &1])
    children = Map.put(children, count, mote)
    state = Map.put(state, :children, children)
    state = focus_update(state)
    {state, count}
  end

  # strict to catch focus handling bugs
  def handle(%{focus: nil} = state, {:key, _, _}), do: {state, nil}

  def handle(%{focus: focus, root: root} = state, {:key, _, _} = event) do
    mote = get_child(state, focus)
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
            mote = mote_focused(mote, false)
            state = put_in(state, [:children, focus], mote)
            mote = get_child(state, next)
            mote = mote_focused(mote, true)
            state = put_in(state, [:children, next], mote)
            {Map.put(state, :focus, next), nil}
        end

      _ ->
        {Map.put(state, focus, mote), {focus, event}}
    end
  end

  def handle(state, _event), do: {state, nil}

  def render(%{index: index, children: children}, canvas) do
    for id <- Enum.reverse(index), reduce: canvas do
      canvas ->
        mote = Map.get(children, id)
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
      for id <- index, reduce: {nil, false} do
        {nil, true} ->
          {id, true}

        {next, true} ->
          {next, true}

        {_, false} ->
          case id do
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
    index = Enum.filter(index, &child_focusable(state, &1))
    index = Enum.reverse(index)
    Enum.sort(index, &focus_compare(state, &1, &2))
  end

  defp focus_compare(state, id1, id2) do
    fi1 = child_findex(state, id1)
    fi2 = child_findex(state, id2)
    fi1 <= fi2
  end

  defp focus_update(state) do
    %{
      enabled: enabled,
      focused: focused,
      focus: focus
    } = state

    index = focus_list(state)
    mote = get_child(state, focus)

    case {index, mote, enabled && focused} do
      {[], nil, true} ->
        %{state | focus: nil}

      {_, nil, true} ->
        [focus | _] = index
        mote = get_child(state, focus)
        mote = mote_focused(mote, true)
        state = Map.put(state, :focus, focus)
        put_child(state, focus, mote)

      {_, nil, false} ->
        %{state | focus: nil}

      {_, _, false} ->
        mote = mote_focused(mote, false)
        state = %{state | focus: nil}
        put_child(state, focus, mote)

      _ ->
        state
    end
  end

  defp get_child(state, id), do: get_in(state, [:children, id])
  defp put_child(state, id, child), do: put_in(state, [:children, id], child)
  defp mote_bounds({module, state}), do: module.bounds(state)
  defp child_focusable(state, id), do: mote_focusable(get_child(state, id))
  defp child_findex(state, id), do: mote_findex(get_child(state, id))
  defp mote_findex({module, state}), do: module.findex(state)
  defp mote_focusable({module, state}), do: module.focusable(state)
  defp mote_focused({module, state}, focused), do: {module, module.focused(state, focused)}
  defp mote_render({module, state}, canvas), do: module.render(state, canvas)

  defp mote_handle({module, state}, event) do
    {state, event} = module.handle(state, event)
    {{module, state}, event}
  end
end
