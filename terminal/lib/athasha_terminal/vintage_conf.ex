defmodule AthashaTerminal.VintageConf do
  alias AthashaTerminal.App
  alias AthashaTerminal.Frame
  alias AthashaTerminal.Label
  alias AthashaTerminal.VintageEth

  def init(opts) do
    focus = Keyword.fetch!(opts, :focus)
    origin = Keyword.fetch!(opts, :origin)
    size = Keyword.fetch!(opts, :size)

    {width, _height} = size
    {orig_x, orig_y} = origin

    nx = orig_x + 2
    ny = orig_y + 2
    nw = width - 9
    mx = nx
    my = ny + 1
    mw = nw
    ex = nx
    ey = ny + 3

    {frame, _} =
      App.init(Frame, size: size, origin: origin, focus: focus, title: "NIC Configuration")

    {lnic, nil} = App.init(Label, origin: {nx, ny}, width: 4, text: "NIC:")
    {lmac, nil} = App.init(Label, origin: {mx, my}, width: 4, text: "MAC:")
    {nic, nil} = App.init(Label, origin: {nx + 5, ny}, width: nw, text: "")
    {mac, nil} = App.init(Label, origin: {mx + 5, my}, width: mw, text: "")
    {eth, nil} = App.init(VintageEth, origin: {ex, ey})

    state = %{
      frame: frame,
      lnic: lnic,
      lmac: lmac,
      eth: eth,
      nic: nic,
      mac: mac
    }

    {state, nil}
  end

  def update(state, {:focus, _} = event) do
    {state, _} = App.kupdate(state, :frame, event)
    {state, _} = App.kupdate(state, :eth, event)
    {state, nil}
  end

  def update(state, {:nic, nic, conf}) do
    case conf do
      %{mac: mac, type: VintageNetEthernet, ipv4: ipv4} ->
        {state, nil} = App.kupdate(state, :eth, {:ipv4, nic, ipv4, nil})
        {state, nil} = App.kupdate(state, :nic, {:text, "#{nic}"})
        {state, nil} = App.kupdate(state, :mac, {:text, "#{mac}"})
        {state, nil}

      %{mac: mac, type: VintageNetWiFi, ipv4: ipv4, vintage_net_wifi: wifi} ->
        {state, nil} = App.kupdate(state, :eth, {:ipv4, nic, ipv4, wifi})
        {state, nil} = App.kupdate(state, :nic, {:text, "#{nic}"})
        {state, nil} = App.kupdate(state, :mac, {:text, "#{mac}"})
        {state, nil}

      other ->
        state = %{state | nic: nic, mac: nil}
        {state, nil} = App.kupdate(state, :eth, {:ipv4, nil, nil, nil})
        {state, nil} = App.kupdate(state, :nic, {:text, ""})
        {state, nil} = App.kupdate(state, :mac, {:text, ""})
        {state, "#{inspect(other)}"}
    end
  end

  def update(state, {:key, _, _} = event) do
    App.kupdate(state, :eth, event)
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      frame: frame,
      eth: eth,
      lnic: lnic,
      lmac: lmac,
      nic: nic,
      mac: mac
    } = state

    canvas = App.render(frame, canvas)
    canvas = App.render(lnic, canvas)
    canvas = App.render(lmac, canvas)
    canvas = App.render(nic, canvas)
    canvas = App.render(mac, canvas)
    canvas = App.render(eth, canvas)
    canvas
  end
end
