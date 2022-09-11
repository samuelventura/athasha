defmodule AthashaFirmware.VintageExec do
  alias AthashaFirmware.VintageLib
  alias AthashaFirmware.VintageApi
  use AthashaFirmware.VintageConst

  def set_config(config) do
    ipv4 =
      case config do
        %{type: 0} ->
          nil

        %{type: 1} ->
          %{method: :dhcp}

        %{type: 2, address: address, gateway: gateway, netmask: netmask, nameserver: nameserver} ->
          VintageApi.valid_ip!(address, "Invalid address")
          VintageApi.valid_ip!(netmask, "Invalid netmask")
          # gateway and nameserver are optional
          VintageApi.valid_ipo!(gateway, "Invalid gateway")
          VintageApi.valid_ipo!(nameserver, "Invalid nameserver")
          if gateway != "", do: VintageApi.same_segment!(netmask, address, gateway)
          name_servers = if nameserver == "", do: [], else: [nameserver]
          append = fn map -> if gateway == "", do: map, else: Map.put(map, :gateway, gateway) end

          %{
            method: :static,
            address: address,
            prefix_length: VintageApi.nmn(netmask),
            name_servers: name_servers
          }
          |> append.()
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

  def get_config(nic) do
    mac = VintageApi.get_mac(nic)
    default = VintageApi.get_default(nic)
    config = VintageLib.get_configuration(nic)

    config =
      case config do
        %{type: VintageNet.Technology.Null} ->
          %{wifi: false, type: @disabled}

        %{type: VintageNetEthernet, ipv4: %{method: :dhcp}} ->
          {address, netmask} = VintageApi.get_address_netmask(nic)
          %{wifi: false, type: @dhcp, address: address, netmask: netmask}

        %{
          type: VintageNetEthernet,
          ipv4: %{
            method: :static,
            address: address,
            prefix_length: netmask
          }
        } ->
          gateway = Map.get(config, :gateway, "")

          nameserver =
            case Map.get(config, :name_servers, []) do
              [] -> ""
              [nameserver] -> nameserver
            end

          %{
            wifi: false,
            type: @static,
            address: VintageApi.ips(address),
            gateway: VintageApi.ipso(gateway),
            nameserver: VintageApi.ipso(nameserver),
            netmask: VintageApi.nms(netmask)
          }

        %{
          type: VintageNetWiFi,
          ipv4: %{method: :dhcp},
          vintage_net_wifi: %{networks: [%{ssid: ssid, psk: _password}]}
        } ->
          {address, netmask} = VintageApi.get_address_netmask(nic)
          %{wifi: true, type: @dhcp, ssid: ssid, password: "", address: address, netmask: netmask}

        %{
          type: VintageNetWiFi,
          ipv4: %{
            method: :static,
            address: address,
            prefix_length: netmask
          }
        } ->
          gateway = Map.get(config, :gateway, "")

          nameserver =
            case Map.get(config, :name_servers, []) do
              [] -> ""
              [nameserver] -> nameserver
            end

          %{
            wifi: true,
            type: @static,
            address: VintageApi.ips(address),
            gateway: VintageApi.ipso(gateway),
            nameserver: VintageApi.ipso(nameserver),
            netmask: VintageApi.nms(netmask)
          }
      end

    # deconfigured nics wont report real type
    config =
      case default do
        %{type: VintageNetWiFi} -> %{config | wifi: true}
        %{type: VintageNetEthernet} -> %{config | wifi: false}
      end

    {mac, config}
  end
end
