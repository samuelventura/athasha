defmodule AthashaFirmware.VintageApp do
  alias AthashaFirmware.VintageExec
  use AthashaFirmware.VintageConst
  use Terminal.App

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    nics = Keyword.fetch!(opts, :nics)
    app_init(&main/2, size: size, nics: nics)
  end

  def main(react, %{size: {w, h} = size, nics: [first | _] = nics}) do
    {{fgc, bgc, msg}, set_alert} = use_state(react, :alert, {:black, :black, ""})
    {nic, set_nic} = use_state(react, :nic, nil)
    {mac, set_mac} = use_state(react, :mac, nil)
    {wifi, set_wifi} = use_state(react, :wifi, false)
    {type, set_type} = use_state(react, :type, 0)
    {ssid, set_ssid} = use_state(react, :ssid, "")
    {address, set_address} = use_state(react, :address, "")
    {netmask, set_netmask} = use_state(react, :netmask, "")
    {gateway, set_gateway} = use_state(react, :gateway, "")
    {nameserver, set_nameserver} = use_state(react, :nameserver, "")
    {password, set_password} = use_state(react, :password, "")

    on_type = fn index, _name -> set_type.(index) end

    on_nic = fn _index, nic ->
      set_alert.({:black, :black, ""})
      {mac, config} = VintageExec.get_config(nic)
      set_nic.(nic)
      set_mac.(mac)
      set_address.(Map.get(config, :address, ""))
      set_netmask.(Map.get(config, :netmask, ""))
      set_gateway.(Map.get(config, :gateway, ""))
      set_nameserver.(Map.get(config, :nameserver, ""))
      set_ssid.(Map.get(config, :ssid, ""))
      set_wifi.(Map.get(config, :wifi, false))

      case Map.get(config, :type) do
        @disabled -> set_type.(0)
        @dhcp -> set_type.(1)
        @static -> set_type.(2)
      end
    end

    use_effect(react, :init, [], fn -> on_nic.(0, first) end)

    on_address = fn value -> set_address.(value) end
    on_netmask = fn value -> set_netmask.(value) end
    on_gateway = fn value -> set_gateway.(value) end
    on_nameserver = fn value -> set_nameserver.(value) end
    on_ssid = fn value -> set_ssid.(value) end
    on_password = fn value -> set_password.(value) end

    on_save = fn ->
      set_alert.({:white, :black, "Saving..."})

      config = %{
        nic: nic,
        wifi: wifi,
        type: type,
        ssid: ssid,
        password: password,
        address: address,
        netmask: netmask,
        gateway: gateway,
        nameserver: nameserver
      }

      try do
        VintageExec.set_config(config)
        set_alert.({:white, :blue, "Saved OK"})
      rescue
        e ->
          set_alert.({:white, :red, "#{inspect(e)}"})
      end
    end

    markup :main, Panel, size: size do
      markup(:title, Label, origin: {0, 0}, text: "Network Settings")

      markup(:alert, Label,
        origin: {0, h - 1},
        size: {w, 1},
        text: msg,
        bgcolor: bgc,
        fgcolor: fgc
      )

      markup(:nics_frame, Frame,
        origin: {0, 1},
        size: {12, 6},
        text: "NICs"
      )

      markup(:nics_select, Select,
        origin: {1, 2},
        size: {10, 4},
        on_change: on_nic,
        items: nics
      )

      markup(:config_frame, Frame,
        origin: {12, 1},
        size: {32, 12},
        text: "Configuration"
      )

      markup(:nic_label, Label,
        origin: {13, 2},
        size: {30, 1},
        text: "NIC: #{nic}"
      )

      markup(:mac_label, Label,
        origin: {13, 3},
        size: {30, 1},
        text: "MAC: #{mac}"
      )

      markup(:type, Radio,
        origin: {13, 4},
        size: {30, 1},
        items: [@disabled, @dhcp, @static],
        on_change: on_type,
        selected: type
      )

      markup :wired, Panel, visible: !wifi, origin: {13, 5}, size: {30, 4} do
        markup :manual, &manual/2,
          enabled: type == 2,
          origin: {0, 0},
          size: {30, 4},
          address: address,
          on_address: on_address,
          netmask: netmask,
          on_netmask: on_netmask,
          gateway: gateway,
          on_gateway: on_gateway,
          nameserver: nameserver,
          on_nameserver: on_nameserver do
        end
      end

      markup :wifi, Panel, visible: wifi, origin: {13, 5}, size: {30, 6} do
        markup :wifi, Panel, size: {30, 6} do
          markup(:ssid_label, Label,
            origin: {0, 0},
            size: {30, 1},
            text: "SSID:"
          )

          markup(:ssid_input, Input,
            origin: {12, 0},
            size: {20, 1},
            text: ssid,
            enabled: type > 0,
            on_change: on_ssid
          )

          markup(:password_label, Label,
            origin: {0, 1},
            size: {30, 1},
            text: "Password:"
          )

          markup(:password_input, Input,
            origin: {12, 1},
            size: {20, 1},
            text: password,
            password: true,
            enabled: type > 0,
            on_change: on_password
          )
        end

        markup :manual, &manual/2,
          enabled: type == 2,
          origin: {0, 2},
          size: {30, 4},
          address: address,
          on_address: on_address,
          netmask: netmask,
          on_netmask: on_netmask,
          gateway: gateway,
          on_gateway: on_gateway,
          nameserver: nameserver,
          on_nameserver: on_nameserver do
        end
      end

      markup(:save, Button,
        origin: {13, 11},
        size: {30, 1},
        text: "Save",
        on_click: on_save
      )
    end
  end

  def manual(_react, %{
        enabled: enabled,
        origin: origin,
        size: size,
        address: address,
        on_address: on_address,
        netmask: netmask,
        on_netmask: on_netmask,
        gateway: gateway,
        on_gateway: on_gateway,
        nameserver: nameserver,
        on_nameserver: on_nameserver
      }) do
    markup :manual, Panel, enabled: enabled, origin: origin, size: size do
      markup(:ip_label, Label,
        origin: {0, 0},
        size: {30, 1},
        text: "Address:"
      )

      markup(:ip_input, Input,
        origin: {12, 0},
        size: {20, 1},
        text: address,
        enabled: enabled,
        on_change: on_address
      )

      markup(:nm_label, Label,
        origin: {0, 1},
        size: {30, 1},
        text: "Netmask:"
      )

      markup(:nm_input, Input,
        origin: {12, 1},
        size: {20, 1},
        text: netmask,
        enabled: enabled,
        on_change: on_netmask
      )

      markup(:gw_label, Label,
        origin: {0, 2},
        size: {30, 1},
        text: "Gateway:"
      )

      markup(:gw_input, Input,
        origin: {12, 2},
        size: {20, 1},
        text: gateway,
        enabled: enabled,
        on_change: on_gateway
      )

      markup(:ns_label, Label,
        origin: {0, 3},
        size: {30, 1},
        text: "Nameserver:"
      )

      markup(:ns_input, Input,
        origin: {12, 3},
        size: {20, 1},
        text: nameserver,
        enabled: enabled,
        on_change: on_nameserver
      )
    end
  end

  def log(msg) do
    # 2022-09-10 20:02:49.684244Z
    now = DateTime.utc_now()
    now = String.slice("#{now}", 11..22)
    IO.puts("#{now} #{inspect(self())} #{msg}")
  end
end
