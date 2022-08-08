defmodule AthashaTerminal.VintageNics do
  alias AthashaTerminal.App
  alias AthashaTerminal.Frame
  alias AthashaTerminal.Select
  @eth0 "eth0"
  @wlan0 "wlan0"
  @nics [@eth0, @wlan0]

  def init(opts) do
    focus = Keyword.fetch!(opts, :focus)
    origin = Keyword.fetch!(opts, :origin)
    size = Keyword.fetch!(opts, :size)

    {width, height} = size
    {orig_x, orig_y} = origin

    {frame, _} = App.init(Frame, size: size, origin: origin, focus: focus, title: "NICs")

    {nics, _} =
      App.init(Select,
        items: @nics,
        focus: focus,
        origin: {orig_x + 1, orig_y + 1},
        size: {width - 2, height - 2}
      )

    state = %{
      frame: frame,
      nics: nics
    }

    {state, @eth0}
  end

  def handle(state, {:focus, _} = event) do
    {state, _} = App.khandle(state, :frame, event)
    {state, _} = App.khandle(state, :nics, event)
    {state, nil}
  end

  def handle(state, {:key, _, _} = event) do
    App.khandle(state, :nics, event)
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      frame: frame,
      nics: nics
    } = state

    canvas = App.render(frame, canvas)
    canvas = App.render(nics, canvas)
    canvas
  end
end
