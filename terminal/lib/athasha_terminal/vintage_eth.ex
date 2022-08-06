defmodule AthashaTerminal.VintageEth do
  alias AthashaTerminal.App
  alias AthashaTerminal.Radio
  alias AthashaTerminal.Label
  alias AthashaTerminal.Input
  alias AthashaTerminal.Button

  @disabled "Disabled"
  @dhcp "DHCP"
  @static "Static"

  def init(opts) do
    origin = Keyword.fetch!(opts, :origin)
    focus = Keyword.get(opts, :focus, false)
    nic = Keyword.get(opts, :nic)
    wifi = Keyword.get(opts, :wifi)
    ipv4 = Keyword.get(opts, :ipv4)

    {orig_x, orig_y} = origin

    lw = 12
    tx = orig_x
    ty = orig_y
    tw = 15
    bx = 36
    by = ty + 7

    {radio, {:item, item}} =
      App.init(Radio, focus: focus, origin: {tx, ty}, items: [@disabled, @dhcp, @static])

    {lip, _} = App.init(Label, width: lw, origin: {tx, ty + 1}, text: "Address:")
    {ip, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 1}, text: "10.77.10.1")
    {lnm, _} = App.init(Label, width: lw, origin: {tx, ty + 2}, text: "Netmask:")
    {nm, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 2}, text: "255.0.0.0")
    {lgw, _} = App.init(Label, width: lw, origin: {tx, ty + 3}, text: "Gateway:")
    {gw, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 3}, text: "10.77.0.1")
    {lns, _} = App.init(Label, width: lw, origin: {tx, ty + 4}, text: "Nameserver:")
    {ns, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 4}, text: "10.77.0.1")
    {btn, _} = App.init(Button, width: 8, origin: {bx, by}, text: "Save")

    state = %{
      nic: nic,
      wifi: wifi,
      ipv4: ipv4,
      focus: focus,
      active: :radio,
      radio: radio,
      type: item,
      lip: lip,
      lnm: lnm,
      lgw: lgw,
      lns: lns,
      ip: ip,
      nm: nm,
      gw: gw,
      ns: ns,
      btn: btn
    }

    {state, nil}
  end

  def update(%{active: nil} = state, {:focus, true}) do
    {state, _} = App.kupdate(state, :radio, {:focus, true})
    state = %{state | active: :radio, focus: true}
    {state, nil}
  end

  def update(%{active: active} = state, {:focus, focus}) do
    {state, _} = App.kupdate(state, :radio, {:focus, focus && active == :radio})
    {state, _} = App.kupdate(state, :ip, {:focus, focus && active == :ip})
    {state, _} = App.kupdate(state, :nm, {:focus, focus && active == :nm})
    {state, _} = App.kupdate(state, :gw, {:focus, focus && active == :gw})
    {state, _} = App.kupdate(state, :ns, {:focus, focus && active == :ns})
    {state, _} = App.kupdate(state, :btn, {:focus, focus && active == :btn})
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:ipv4, nic, ipv4, wifi}) do
    type = get(ipv4, :type, @dhcp)
    selected = get(ipv4, :selected, 0)
    {state, _} = App.kupdate(state, :radio, {:selected, selected})
    state = set(state, ipv4, :ip)
    state = set(state, ipv4, :nm)
    state = set(state, ipv4, :gw)
    state = set(state, ipv4, :ns)
    state = %{state | nic: nic, wifi: wifi, type: type, active: :radio}
    {state, nil}
  end

  def update(%{active: active, type: type} = state, {:key, _, _} = event) do
    {state, events} = App.kupdate(state, active, event)

    case {active, events} do
      {:radio, {:item, type}} ->
        enabled = type == @static
        {state, _} = App.kupdate(state, :ip, {:enabled, enabled})
        {state, _} = App.kupdate(state, :nm, {:enabled, enabled})
        {state, _} = App.kupdate(state, :gw, {:enabled, enabled})
        {state, _} = App.kupdate(state, :ns, {:enabled, enabled})
        state = %{state | type: type}
        {state, nil}

      {_, {:focus, _}} ->
        {state, _} = App.kupdate(state, active, {:focus, false})
        active = next(active, type)
        state = %{state | active: active}

        case active do
          nil ->
            {state, events}

          _ ->
            {state, _} = App.kupdate(state, active, {:focus, true})
            {state, nil}
        end

      {:btn, {:click, _}} ->
        %{nic: nic, wifi: wifi} = state
        ip = App.kget(state, :ip, :text)
        nm = App.kget(state, :nm, :text)
        gw = App.kget(state, :gw, :text)
        ns = App.kget(state, :ns, :text)
        conf = %{type: type, nic: nic, wifi: wifi, ip: ip, nm: nm, gw: gw, ns: ns}
        {state, {:save, conf}}

      _ ->
        {state, events}
    end
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      radio: radio,
      lip: lip,
      lnm: lnm,
      lgw: lgw,
      lns: lns,
      ip: ip,
      nm: nm,
      gw: gw,
      ns: ns,
      btn: btn
    } = state

    canvas = App.render(radio, canvas)
    canvas = App.render(lip, canvas)
    canvas = App.render(ip, canvas)
    canvas = App.render(lnm, canvas)
    canvas = App.render(nm, canvas)
    canvas = App.render(lgw, canvas)
    canvas = App.render(gw, canvas)
    canvas = App.render(lns, canvas)
    canvas = App.render(ns, canvas)
    canvas = App.render(btn, canvas)
    canvas
  end

  def set(state, ipv4, key) do
    defval = App.kget(state, key, :text)
    newval = get(ipv4, key, defval)
    enabled = get(ipv4, :enabled, false)
    {state, _} = App.kupdate(state, key, {:enabled, enabled})
    {state, _} = App.kupdate(state, key, {:focus, false})
    {state, _} = App.kupdate(state, key, {:text, newval})
    state
  end

  def next(:btn, _), do: nil
  def next(_, @disabled), do: :btn
  def next(_, @dhcp), do: :btn
  def next(:radio, _), do: :ip
  def next(:ip, _), do: :nm
  def next(:nm, _), do: :gw
  def next(:gw, _), do: :ns
  def next(:ns, _), do: :btn

  def get(nil, _, def), do: def
  def get(%{method: :dhcp}, _, def), do: def
  def get(%{method: :static}, :selected, _), do: 1
  def get(%{method: :static}, :enabled, _), do: true
  def get(%{method: :static}, :type, _), do: @static
  def get(%{method: :static, address: address}, :ip, _), do: address
  def get(%{method: :static, gateway: gateway}, :gw, _), do: gateway
  def get(%{method: :static, name_servers: [name_server]}, :ns, _), do: name_server
  def get(%{method: :static, prefix_length: netmask}, :nm, _), do: "#{netmask}"
end
