defmodule AthashaFirmware.VintageApp do
  @behaviour Terminal.App
  import Terminal.Imports
  alias Terminal.Panel
  alias Terminal.Label
  alias Terminal.Frame
  alias Terminal.Select
  alias Terminal.Grid
  alias Terminal.Radio
  alias Terminal.Input
  alias Terminal.Button
  alias AthashaFirmware.VintageExec
  use AthashaFirmware.VintageConst

  def init(opts) do
    nics = Keyword.fetch!(opts, :nics)
    state = Panel.init(opts ++ [focused: true, root: true])
    ids = %{}
    {state, _} = Panel.append(state, Label, text: "Network Settings")
    {state, _} = Panel.append(state, Frame, origin: {0, 2}, size: {12, 8}, title: "NICs")
    {state, select} = Panel.append(state, Select, origin: {1, 3}, size: {10, 6}, items: nics)
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
    state = id_updates(state, ids.alert, bgcolor: :blue, fgcolor: :white, text: "")

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

  def render(state, canvas), do: Panel.render(state, canvas)
  def execute(cmd), do: VintageExec.execute(cmd)
end
