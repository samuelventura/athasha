defmodule AthashaTerminal.VintageConf do
  def init(opts) do
    focus = Keyword.fetch!(opts, :focus)

    state = %{
      focus: focus,
      panel: nil,
      nic: nil,
      mac: nil
    }

    {state, nil}
  end

  def update(state, {:focus, focus}) do
    state = %{state | focus: focus}
    {state, nil}
  end

  def update(state, {:nic, nic, conf}) do
    case conf do
      %{ipv4: _ipv4, mac: mac, type: VintageNetEthernet} ->
        state = %{state | nic: nic, mac: mac}
        {state, nil}

      %{ipv4: _ipv4, mac: mac, vintage_net_wifi: _wifi, type: VintageNetWiFi} ->
        state = %{state | nic: nic, mac: mac}
        {state, nil}

      other ->
        {state, "#{inspect(other)}"}
    end
  end

  def update(%{focus: true} = state, {:key, _, "\t"}) do
    {state, {:nav, :next}}
  end

  def update(state, _event), do: {state, nil}

  def render(state, size: size, origin: origin) do
    {width, height} = size
    {originx, originy} = origin

    %{
      focus: focus,
      mac: mac,
      nic: nic
    } = state

    config_window = %{
      type: :window,
      x: originx,
      y: originy,
      width: width,
      height: height,
      background: :black,
      foreground: :white,
      border: if(focus, do: :double, else: :single),
      title: "NIC Configuration"
    }

    nic_label = %{
      type: :label,
      x: originx + 2,
      y: originy + 2,
      width: width - 4,
      background: :black,
      foreground: :white,
      text: "NIC: #{nic}"
    }

    mac_label = %{
      type: :label,
      x: originx + 2,
      y: originy + 3,
      width: width - 4,
      background: :black,
      foreground: :white,
      text: "MAC: #{mac}"
    }

    case nic do
      nil -> [config_window]
      _ -> [config_window, nic_label, mac_label]
    end
  end
end
