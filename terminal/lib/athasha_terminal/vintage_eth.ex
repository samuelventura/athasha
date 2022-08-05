defmodule AthashaTerminal.VintageEth do
  alias AthashaTerminal.App
  alias AthashaTerminal.Radio
  alias AthashaTerminal.Label
  alias AthashaTerminal.Input

  @dhcp "DHCP"
  @static "Static"

  def init(opts) do
    origin = Keyword.fetch!(opts, :origin)
    focus = Keyword.get(opts, :focus, false)
    ipv4 = Keyword.get(opts, :ipv4)

    {orig_x, orig_y} = origin

    lw = 12
    tx = orig_x
    ty = orig_y
    tw = 15

    {radio, {:item, item}} =
      App.init(Radio, focus: focus, origin: {tx, ty}, items: [@dhcp, @static])

    {lip, _} = App.init(Label, width: lw, origin: {tx, ty + 1}, text: "Address:")
    {ip, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 1}, text: "10.77.5.10")
    {lnm, _} = App.init(Label, width: lw, origin: {tx, ty + 2}, text: "Netmask:")
    {nm, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 2}, text: "8")
    {lgw, _} = App.init(Label, width: lw, origin: {tx, ty + 3}, text: "Gateway:")
    {gw, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 3}, text: "10.77.0.1")
    {lns, _} = App.init(Label, width: lw, origin: {tx, ty + 4}, text: "Nameserver:")
    {ns, _} = App.init(Input, width: tw, origin: {tx + lw, ty + 4}, text: "10.77.0.1")

    state = %{
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
      ns: ns
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
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:ipv4, ipv4}) do
    type = get(ipv4, :type, @dhcp)
    selected = get(ipv4, :selected, 0)
    {state, _} = App.kupdate(state, :radio, {:selected, selected})
    state = set(state, ipv4, :ip)
    state = set(state, ipv4, :nm)
    state = set(state, ipv4, :gw)
    state = set(state, ipv4, :ns)
    state = %{state | type: type, active: :radio}
    {state, nil}
  end

  def update(%{active: active, type: type} = state, {:key, _, _} = event) do
    {state, events} = App.kupdate(state, active, event)

    case events do
      {:item, type} ->
        enabled = type == @static
        {state, _} = App.kupdate(state, :ip, {:enabled, enabled})
        {state, _} = App.kupdate(state, :nm, {:enabled, enabled})
        {state, _} = App.kupdate(state, :gw, {:enabled, enabled})
        {state, _} = App.kupdate(state, :ns, {:enabled, enabled})
        state = %{state | type: type}
        {state, nil}

      {:nav, _} ->
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
      ns: ns
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

  def next(_, @dhcp), do: nil
  def next(:radio, _), do: :ip
  def next(:ip, _), do: :nm
  def next(:nm, _), do: :gw
  def next(:gw, _), do: :ns
  def next(:ns, _), do: nil

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