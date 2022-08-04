defmodule AthashaTerminal.VintageConf do
  alias AthashaTerminal.App
  alias AthashaTerminal.Frame
  alias AthashaTerminal.Label

  def init(opts) do
    focus = Keyword.fetch!(opts, :focus)
    origin = Keyword.fetch!(opts, :origin)
    size = Keyword.fetch!(opts, :size)

    {width, _height} = size
    {orig_x, orig_y} = origin

    nx = orig_x + 2
    ny = orig_y + 2
    nw = width - 4
    mx = nx
    my = ny + 1
    mw = nw

    {frame, _} =
      App.init(Frame, size: size, origin: origin, focus: focus, title: "NIC Configuration")

    {nic, nil} = App.init(Label, origin: {nx, ny}, width: nw, text: "NIC:")
    {mac, nil} = App.init(Label, origin: {mx, my}, width: mw, text: "MAC:")

    state = %{
      frame: frame,
      nic: nic,
      mac: mac
    }

    {state, nil}
  end

  def update(state, {:focus, _} = event) do
    App.kupdate(state, :frame, event)
  end

  def update(state, {:nic, nic, conf}) do
    case conf do
      %{mac: mac, type: VintageNetEthernet, ipv4: _ipv4} ->
        {state, nil} = App.kupdate(state, :nic, {:text, "NIC: #{nic}"})
        {state, nil} = App.kupdate(state, :mac, {:text, "MAC: #{mac}"})
        {state, nil}

      %{mac: mac, type: VintageNetWiFi, ipv4: _ipv4, vintage_net_wifi: _wifi} ->
        {state, nil} = App.kupdate(state, :nic, {:text, "NIC: #{nic}"})
        {state, nil} = App.kupdate(state, :mac, {:text, "MAC: #{mac}"})
        {state, nil}

      other ->
        state = %{state | nic: nic, mac: nil, ipv4: nil}
        {state, nil} = App.kupdate(state, :nic, {:text, "NIC:"})
        {state, nil} = App.kupdate(state, :mac, {:text, "MAC:"})
        {state, "#{inspect(other)}"}
    end
  end

  def update(state, {:key, _, "\t"}) do
    {state, {:nav, :next}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      frame: frame,
      nic: nic,
      mac: mac
    } = state

    canvas = App.render(frame, canvas)
    canvas = App.render(nic, canvas)
    canvas = App.render(mac, canvas)
    canvas
  end
end
