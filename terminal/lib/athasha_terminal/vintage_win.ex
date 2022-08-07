defmodule AthashaTerminal.VintageWin do
  alias AthashaTerminal.Panel
  alias AthashaTerminal.Label
  alias AthashaTerminal.Frame
  # alias AthashaTerminal.Select

  # @eth0 "eth0"
  # @wlan0 "wlan0"
  # @nics [@eth0, @wlan0]

  def init(opts) do
    state = Panel.init(opts)

    # {width, _} = Panel.select(state, :size)
    {state, _} = Panel.add(state, Label, text: "Network Settings")
    {state, _} = Panel.add(state, Frame, origin: {0, 2}, size: {10, 6}, title: "NICs")
    # {state, _} = Panel.add(state, Select, origin: {1, 3}, size: {8, 4}, items: @nics)

    state
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    Panel.render(state, canvas)
  end
end
