defmodule AthashaFirmware.VintageExec do
  alias AthashaFirmware.VintageLib
  import AthashaFirmware.VintageApi
  use AthashaFirmware.VintageConst

  def execute({:save, config}) do
    ipv4 =
      case config do
        %{type: 0} ->
          nil

        %{type: 1} ->
          %{method: :dhcp}

        %{type: 2, address: address, gateway: gateway, netmask: netmask, nameserver: nameserver} ->
          valid_ip!(address, "Invalid address")
          valid_ip!(netmask, "Invalid netmask")
          valid_ip!(gateway, "Invalid gateway")
          valid_ip!(nameserver, "Invalid nameserver")
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
end
