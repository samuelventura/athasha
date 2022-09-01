ExUnit.start()

defmodule Control do
  @behaviour Terminal.Window
  def init(state), do: state
  def count(%{count: count}), do: count
  def bounds(%{bounds: bounds} = state), do: bounds
  def findex(%{findex: findex} = state), do: findex
  def bounds(state, bounds), do: %{state | bounds: bounds}
  def focused(state, focused), do: %{state | focused: focused}
  def focusable(%{findex: findex, enabled: enabled}), do: findex >= 0 && enabled
  def handle(state, _event), do: {state, nil}
  def render(_state, canvas), do: canvas
  def update(state, name, value), do: Map.put(state, name, value)
  def select(state, name, value), do: Map.get(state, name, value)
end
