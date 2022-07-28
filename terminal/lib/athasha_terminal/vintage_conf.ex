defmodule AthashaTerminal.VintageConf do
  def init(opts) do
    focus = Keyword.fetch!(opts, :focus)

    %{
      focus: focus,
      type: nil,
      nic: nil,
      mac: nil,
      conf: nil
    }
  end

  def update(state, {:focus, focus}) do
    %{state | focus: focus}
  end

  def update(state, {:nic, nic, conf}) do
    case conf do
      %{ipv4: ipv4, mac: mac, type: VintageNetEthernet} ->
        state = %{state | type: :eth, nic: nic, mac: mac, conf: ipv4}
        {state, nil}

      %{ipv4: ipv4, mac: mac, vintage_net_wifi: wifi, type: VintageNetWiFi} ->
        state = %{state | type: :wifi, nic: nic, mac: mac, conf: {ipv4, wifi}}
        {state, nil}

      other ->
        {state, "#{inspect(other)}"}
    end
  end

  def render(state, size: size, origin: origin) do
    {width, height} = size
    {originx, originy} = origin

    %{
      focus: focus,
      type: _type,
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

    mac_label = %{
      type: :label,
      x: originx + 2,
      y: originy + 2,
      width: width - 4,
      background: :black,
      foreground: :white,
      text: "MAC: #{mac}"
    }

    case nic do
      nil -> [config_window]
      _ -> [config_window, mac_label]
    end
  end
end
