defmodule Terminal.Demo do
  @behaviour Terminal.App
  alias Terminal.Panel
  alias Terminal.Button

  def init(opts) do
    size = Keyword.fetch!(opts, :size)

    panel = Panel.init(size: size, focused: true, root: true)

    button = Button.init(enabled: false, text: "Button")
    {panel, button} = Panel.append(panel, {Button, button})

    state = %{panel: panel, button: button}

    {state, nil}
  end

  def handle(%{panel: panel} = state, {:key, _, _} = event) do
    {panel, cmd} = Panel.handle(panel, event)
    state = %{state | panel: panel}
    IO.inspect({:handle, event, cmd})
    {state, nil}
  end

  def handle(state, event) do
    IO.inspect({:handle, event})
    {state, nil}
  end

  def render(%{panel: panel}, canvas) do
    Panel.render(panel, canvas)
  end

  def execute(cmd), do: IO.inspect({:cmd, cmd})
end
