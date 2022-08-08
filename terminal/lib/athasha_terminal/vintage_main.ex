defmodule AthashaTerminal.VintageMain do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.Panel
  alias AthashaTerminal.Label
  alias AthashaTerminal.Frame
  alias AthashaTerminal.Select

  @eth0 "eth0"
  @wlan0 "wlan0"
  @nics [@eth0, @wlan0]

  def init(opts) do
    state = Panel.init(opts ++ [focused: true])

    {state, _} = Panel.append(state, Label, text: "Network Settings")
    {state, _} = Panel.append(state, Frame, origin: {0, 2}, size: {10, 6}, title: "NICs")
    {state, _} = Panel.append(state, Select, origin: {1, 3}, size: {8, 4}, items: @nics)

    {state, []}
  end

  def handle(state, event) do
    {state, event} = Panel.handle(state, event)
    IO.inspect(event)
    {state, []}
  end

  def render(state, canvas) do
    Panel.render(state, canvas)
  end

  def execute(_cmd), do: nil
end
