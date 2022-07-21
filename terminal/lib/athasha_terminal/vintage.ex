defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  def init(_opts) do
    nil
  end

  def update(state, _event) do
    state
  end

  def render(_state) do
    [
      {:window, x: 0, y: 1}
    ]
  end
end
