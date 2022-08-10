defmodule AthashaTerminal.VintageMain do
  @behaviour AthashaTerminal.App
  import AthashaTerminal.Window
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
    state = Panel.init(opts ++ [focused: true, root: true])
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
      id_callback(state, labels, ids, fn state, ids ->
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

    ids = Map.put(ids, :radio, radio)

    {state, editors} =
      Panel.append(state, Grid, origin: {14, 6}, size: {30, 7}, columns: [12, 18])

    ids = Map.put(ids, :editors, editors)

    {state, ids} =
      id_callback(state, editors, ids, fn state, ids ->
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
        {state, password} = Grid.append(state, Input, enabled: false, password: true)
        ids = Map.put(ids, :password, password)
        {state, _} = Grid.append(state, Label)
        {state, save} = Grid.append(state, Button, enabled: false, text: "Save")
        ids = Map.put(ids, :save, save)
        {state, ids}
      end)

    %{size: {width, height}} = state

    {state, alert} =
      Panel.append(state, Label, origin: {0, height - 1}, size: {width, 1}, text: "")

    ids = Map.put(ids, :alert, alert)
    # IO.inspect(ids)
    state = Map.put(state, :ids, ids)
    nic = id_select(state, select, :item, nil)
    {state, {:get, nic}}
  end

  def handle(%{ids: ids} = state, {:cmd, {:save, _config}, res}) do
    state =
      case res do
        :ok ->
          id_updates(state, ids.alert,
            bgcolor: :blue,
            fgcolor: :white,
            text: "Success configuring interface"
          )

        _ ->
          id_updates(state, ids.alert, bgcolor: :red, fgcolor: :white, text: "#{inspect(res)}")
      end

    {state, nil}
  end

  def handle(%{ids: ids} = state, {:cmd, {:get, nic}, res}) do
    state = Map.delete(state, :wifi)
    state = id_updates(state, ids.editors, enabled: false)
    state = id_updates(state, ids.alert, bgcolor: :black, fgcolor: :white, text: "")

    {state, _} =
      id_callback(state, ids.labels, nil, fn state, _ ->
        state = id_update(state, ids.nic, :text, nic)
        state = id_update(state, ids.mac, :text, "")
        {state, nil}
      end)

    {state, _} =
      id_callback(state, ids.editors, nil, fn state, _ ->
        state = id_updates(state, ids.address, enabled: false, text: "")
        state = id_updates(state, ids.netmask, enabled: false, text: "")
        state = id_updates(state, ids.gateway, enabled: false, text: "")
        state = id_updates(state, ids.nameserver, enabled: false, text: "")
        state = id_updates(state, ids.ssid, enabled: false, text: "")
        state = id_updates(state, ids.password, enabled: false, text: "")
        state = id_updates(state, ids.save, enabled: false)
        {state, nil}
      end)

    case res do
      {:ok, mac, res} ->
        %{wifi: wifi} = res
        state = Map.put(state, :wifi, wifi)
        state = id_updates(state, ids.editors, enabled: true)

        {state, _} =
          id_callback(state, ids.labels, nil, fn state, _ ->
            state = id_updates(state, ids.mac, text: mac)
            {state, nil}
          end)

        state =
          case res do
            %{type: @disabled} ->
              id_updates(state, ids.radio, enabled: true, selected: 0)

            %{type: @dhcp, address: address, netmask: netmask} ->
              {state, _} =
                id_callback(state, ids.editors, nil, fn state, _ ->
                  state = id_updates(state, ids.address, text: address)
                  state = id_updates(state, ids.netmask, text: netmask)
                  {state, nil}
                end)

              id_updates(state, ids.radio, enabled: true, selected: 1)

            %{
              type: @static,
              address: address,
              netmask: netmask,
              gateway: gateway,
              nameserver: nameserver
            } ->
              {state, _} =
                id_callback(state, ids.editors, nil, fn state, _ ->
                  state = id_updates(state, ids.address, enabled: true, text: address)
                  state = id_updates(state, ids.netmask, enabled: true, text: netmask)
                  state = id_updates(state, ids.gateway, enabled: true, text: gateway)
                  state = id_updates(state, ids.nameserver, enabled: true, text: nameserver)
                  {state, nil}
                end)

              id_updates(state, ids.radio, enabled: true, selected: 2)
          end

        state =
          case res do
            %{wifi: false} ->
              state

            %{type: @disabled} ->
              state

            %{ssid: ssid, password: password} ->
              {state, _} =
                id_callback(state, ids.editors, nil, fn state, _ ->
                  state = id_updates(state, ids.ssid, enabled: true, text: ssid)
                  state = id_updates(state, ids.password, enabled: true, text: password)
                  {state, nil}
                end)

              state
          end

        {state, _} =
          id_callback(state, ids.editors, nil, fn state, _ ->
            state = id_updates(state, ids.save, enabled: true)
            {state, nil}
          end)

        {state, nil}

      _ ->
        state =
          id_updates(state, ids.alert,
            bgcolor: :red,
            fgcolor: :white,
            text: "#{inspect(res)}"
          )

        state = id_updates(state, ids.radio, enabled: false)

        {state, nil}
    end
  end

  def handle(%{ids: ids} = state, {:resize, width, height}) do
    state = id_updates(state, ids.alert, origin: {0, height - 1}, size: {width, 1})
    {state, nil}
  end

  def handle(%{ids: ids} = state, event) do
    {state, event} = Panel.handle(state, event)
    select = ids.select
    radio = ids.radio
    save = ids.save
    editors = ids.editors

    case event do
      {^radio, {:item, type}} ->
        enabled = type == @static
        wifi = Map.get(state, :wifi, false) && type != @disabled

        {state, _} =
          id_callback(state, ids.editors, nil, fn state, _ ->
            state = id_updates(state, ids.address, enabled: enabled)
            state = id_updates(state, ids.netmask, enabled: enabled)
            state = id_updates(state, ids.gateway, enabled: enabled)
            state = id_updates(state, ids.nameserver, enabled: enabled)
            state = id_updates(state, ids.ssid, enabled: wifi)
            state = id_updates(state, ids.password, enabled: wifi)
            {state, nil}
          end)

        {state, nil}

      {^select, {:item, nic}} ->
        state =
          id_updates(state, ids.alert,
            bgcolor: :blue,
            fgcolor: :white,
            text: "Getting configuration..."
          )

        {state, {:get, nic}}

      {^editors, {^save, {:click, _}}} ->
        state =
          id_updates(state, ids.alert,
            bgcolor: :blue,
            fgcolor: :white,
            text: "Saving configuration..."
          )

        {state, config} =
          id_callback(state, ids.labels, %{}, fn state, config ->
            config = Map.put(config, :nic, id_select(state, ids.nic, :text))
            {state, config}
          end)

        {state, config} =
          id_callback(state, ids.editors, config, fn state, config ->
            config = Map.put(config, :address, id_select(state, ids.address, :text))
            config = Map.put(config, :netmask, id_select(state, ids.netmask, :text))
            config = Map.put(config, :gateway, id_select(state, ids.gateway, :text))
            config = Map.put(config, :nameserver, id_select(state, ids.nameserver, :text))
            config = Map.put(config, :ssid, id_select(state, ids.ssid, :text))
            config = Map.put(config, :password, id_select(state, ids.password, :text))
            {state, config}
          end)

        config = Map.put(config, :type, id_select(state, ids.radio, :selected))
        config = Map.put(config, :wifi, Map.get(state, :wifi))
        {state, {:save, config}}

      _ ->
        {state, nil}
    end
  end

  def render(state, canvas) do
    Panel.render(state, canvas)
  end

  def execute({:save, config}) do
    ipv4 =
      case config do
        %{type: 0} ->
          nil

        %{type: 1} ->
          %{method: :dhcp}

        %{type: 2, address: address, gateway: gateway, netmask: netmask, nameserver: nameserver} ->
          valid_ip!(address, "Invalid address")
          valid_ip!(nameserver, "Invalid nameserver")
          valid_ip!(gateway, "Invalid gateway")
          valid_ip!(netmask, "Invalid netmask")
          same_segment!(netmask, address, gateway)

          %{
            method: :static,
            address: address,
            gateway: gateway,
            prefix_length: nmn(netmask),
            name_servers: [nameserver]
          }
      end

    case config do
      %{type: 0, nic: nic} ->
        VintageLib.deconfigure(nic)

      %{nic: nic, wifi: true, ssid: ssid, password: password} ->
        VintageLib.configure(nic, %{
          type: VintageNetWiFi,
          ipv4: ipv4,
          vintage_net_wifi: %{
            networks: [
              %{
                ssid: ssid,
                key_mgmt: :wpa_psk,
                psk: password
              }
            ]
          }
        })

      %{nic: nic, wifi: false} ->
        VintageLib.configure(nic, %{type: VintageNetEthernet, ipv4: ipv4})
    end
  end

  def execute({:get, nic}) do
    mac = get_mac(nic)
    default = get_default(nic)
    config = VintageLib.get_configuration(nic)

    config =
      case config do
        %{type: VintageNet.Technology.Null} ->
          %{wifi: false, type: @disabled}

        %{type: VintageNetEthernet, ipv4: %{method: :dhcp}} ->
          {address, netmask} = get_address_netmask(nic)
          %{wifi: false, type: @dhcp, address: address, netmask: netmask}

        %{
          type: VintageNetEthernet,
          ipv4: %{
            method: :static,
            address: address,
            gateway: gateway,
            name_servers: [nameserver],
            prefix_length: netmask
          }
        } ->
          %{
            wifi: false,
            type: @static,
            address: ips(address),
            gateway: ips(gateway),
            nameserver: ips(nameserver),
            netmask: nms(netmask)
          }

        %{
          type: VintageNetWiFi,
          ipv4: %{method: :dhcp},
          vintage_net_wifi: %{networks: [%{ssid: ssid, psk: _password}]}
        } ->
          {address, netmask} = get_address_netmask(nic)
          %{wifi: true, type: @dhcp, ssid: ssid, password: "", address: address, netmask: netmask}

        %{
          type: VintageNetWiFi,
          ipv4: %{
            method: :static,
            address: address,
            gateway: gateway,
            name_servers: [nameserver],
            prefix_length: netmask
          }
        } ->
          %{
            wifi: true,
            type: @static,
            address: ips(address),
            gateway: ips(gateway),
            nameserver: ips(nameserver),
            netmask: nms(netmask)
          }
      end

    # deconfigured nics wont report real type
    config =
      case default do
        %{type: VintageNetWiFi} -> %{config | wifi: true}
        %{type: VintageNetEthernet} -> %{config | wifi: false}
      end

    {:ok, mac, config}
  end

  defp ips({a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  defp nms(n), do: ips(VintageLib.prefix_length_to_subnet_mask(n))

  defp nmn(nm) do
    {:ok, ip} = :inet.parse_address(String.to_charlist(nm))

    case VintageLib.subnet_mask_to_prefix_length(ip) do
      {:ok, n} -> n
      {:error, _} -> raise "Invalid netmask #{nm}"
    end
  end

  defp valid_ip!(text, msg) do
    case :inet.parse_address(String.to_charlist(text)) do
      {:ok, _} -> nil
      {:error, _} -> raise "#{msg} #{text}"
    end
  end

  defp same_segment!(netmask, address, gateway) do
    {:ok, {n0, n1, n2, n3}} = :inet.parse_address(String.to_charlist(netmask))
    {:ok, {a0, a1, a2, a3}} = :inet.parse_address(String.to_charlist(address))
    {:ok, {g0, g1, g2, g3}} = :inet.parse_address(String.to_charlist(gateway))
    as = {Bitwise.band(n0, a0), Bitwise.band(n1, a1), Bitwise.band(n2, a2), Bitwise.band(n3, a3)}
    gs = {Bitwise.band(n0, g0), Bitwise.band(n1, g1), Bitwise.band(n2, g2), Bitwise.band(n3, g3)}
    if as != gs, do: raise("Invalid gateway segment #{gateway}")
  end

  defp get_address_netmask(nic) do
    [{["interface", ^nic, "addresses"], list}] =
      VintageLib.get_by_prefix(["interface", nic, "addresses"])

    Enum.find_value(list, {"", ""}, fn m ->
      %{family: f, address: ip, netmask: nm} = m

      case f do
        :inet -> {ips(ip), ips(nm)}
        _ -> false
      end
    end)
  end

  defp get_mac(nic) do
    case VintageLib.get_by_prefix(["interface", nic, "mac_address"]) do
      [{["interface", ^nic, "mac_address"], value}] -> value
      _ -> ""
    end
  end

  defp get_default(nic) do
    env = VintageLib.get_all_env()
    defaults = Keyword.fetch!(env, :config)
    defaults = Enum.into(defaults, %{})
    Map.fetch!(defaults, nic)
  end
end
