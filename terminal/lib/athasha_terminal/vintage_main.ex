defmodule AthashaTerminal.VintageMain do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.Panel
  alias AthashaTerminal.Label
  alias AthashaTerminal.Frame
  alias AthashaTerminal.Select
  alias AthashaTerminal.Grid
  alias AthashaTerminal.Radio
  alias AthashaTerminal.Input
  alias AthashaTerminal.Button
  alias AthashaTerminal.VintageLib

  @eth0 "eth0"
  @wlan0 "wlan0"
  @disabled "Disabled"
  @dhcp "DHCP"
  @static "Static"

  @nics [@eth0, @wlan0]

  def init(opts) do
    state = Panel.init(opts ++ [focused: true])

    ids = %{}
    {state, _} = Panel.append(state, Label, text: "Network Settings")
    {state, _} = Panel.append(state, Frame, origin: {0, 2}, size: {12, 8}, title: "NICs")
    {state, select} = Panel.append(state, Select, origin: {1, 3}, size: {10, 6}, items: @nics)
    ids = Map.put(ids, :select, select)

    {state, _} =
      Panel.append(state, Frame, origin: {13, 2}, size: {32, 12}, title: "NIC Configuration")

    {state, labels} = Panel.append(state, Grid, origin: {14, 3}, size: {30, 2}, columns: [12, 18])
    ids = Map.put(ids, :labels, labels)

    {state, ids} =
      Panel.id_callback(state, labels, ids, fn state, _ ->
        {state, _} = Grid.append(state, Label, text: "NIC:")
        {state, nic} = Grid.append(state, Label)
        ids = Map.put(ids, :nic, nic)
        {state, _} = Grid.append(state, Label, text: "MAC:")
        {state, mac} = Grid.append(state, Label)
        ids = Map.put(ids, :mac, mac)
        {state, ids}
      end)

    {state, radio} =
      Panel.append(state, Radio,
        origin: {14, 5},
        size: {30, 1},
        enabled: false,
        items: [@disabled, @dhcp, @static]
      )

    {state, editors} =
      Panel.append(state, Grid, origin: {14, 6}, size: {30, 7}, columns: [12, 18])

    ids = Map.put(ids, :editors, editors)

    {state, ids} =
      Panel.id_callback(state, editors, ids, fn state, _ ->
        {state, _} = Grid.append(state, Label, text: "Address:")
        {state, address} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :address, address)
        {state, _} = Grid.append(state, Label, text: "Netmask:")
        {state, netmask} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :netmask, netmask)
        {state, _} = Grid.append(state, Label, text: "Gateway:")
        {state, gateway} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :gateway, gateway)
        {state, _} = Grid.append(state, Label, text: "Nameserver:")
        {state, nameserver} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :nameserver, nameserver)
        {state, _} = Grid.append(state, Label, text: "SSID:")
        {state, ssid} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :ssid, ssid)
        {state, _} = Grid.append(state, Label, text: "Password:")
        {state, password} = Grid.append(state, Input, enabled: false)
        ids = Map.put(ids, :password, password)
        {state, _} = Grid.append(state, Label)
        {state, save} = Grid.append(state, Button, enabled: false, text: "Save")
        ids = Map.put(ids, :save, save)
        {state, ids}
      end)

    ids = Map.put(ids, :radio, radio)
    state = Map.put(state, :ids, ids)
    nic = Panel.id_select(state, select, :item, nil)
    {state, {:get, nic}}
  end

  def handle(state, {:cmd, {:get, _nic}, _res}) do
    {state, nil}
  end

  def handle(state, event) do
    {state, event} = Panel.handle(state, event)

    case event do
      {_, {:item, nic}} -> {state, {:get, nic}}
      _ -> {state, nil}
    end
  end

  def render(state, canvas) do
    Panel.render(state, canvas)
  end

  def execute({:get, nic}) do
    mac = VintageLib.get_mac!(nic)
    mac = MACAddress.to_hex(mac)
    config = VintageLib.get_configuration(nic)
    Map.put(config, :mac, mac)
  end

  def execute(_cmd), do: nil
end
