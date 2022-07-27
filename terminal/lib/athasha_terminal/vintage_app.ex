defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.VintageLib

  @eth0 "eth0"
  @wlan0 "wlan0"

  def init(opts) do
    nics = [@eth0, @wlan0]
    next = %{nil => @eth0, @wlan0 => @eth0, @eth0 => @wlan0}
    prev = %{nil => @wlan0, @wlan0 => @eth0, @eth0 => @wlan0}

    {%{
       origin: {0, 0},
       size: Keyword.fetch!(opts, :size),
       nics: %{list: nics, next: next, prev: prev},
       focus: :nics,
       nic: nil,
       conf: nil,
       error: nil
     }, [{:get, @eth0}]}
  end

  def update(state, {:cmd, {:get, nic}, res}) do
    case res do
      %{ipv4: ipv4, type: VintageNetEthernet} ->
        state = %{state | conf: ipv4, nic: nic}
        {state, []}

      %{ipv4: ipv4, vintage_net_wifi: wifi, type: VintageNetWiFi} ->
        state = %{state | conf: {ipv4, wifi}, nic: nic}
        {state, []}

      other ->
        state = %{state | error: "#{inspect(other)}"}
        {state, []}
    end
  end

  def update(%{focus: :nics} = state, {:key, _, :arrow_down}) do
    %{nics: nics, nic: nic} = state
    nic = Map.get(nics.next, nic)
    {state, [{:get, nic}]}
  end

  def update(%{focus: :nics} = state, {:key, _, :arrow_up}) do
    %{nics: nics, nic: nic} = state
    nic = Map.get(nics.prev, nic)
    {state, [{:get, nic}]}
  end

  def update(state, _event) do
    {state, []}
  end

  def render(state) do
    %{nics: nics, nic: nic, origin: {ox, oy}} = state
    %{size: {width, _height}, error: error} = state

    title_label = %{
      type: :label,
      x: ox,
      y: oy,
      width: width,
      background: :black,
      foreground: :white,
      text: "Network Settings"
    }

    nics_window = %{
      type: :window,
      x: ox,
      y: oy + 2,
      width: 12,
      height: 4,
      background: :black,
      foreground: :white,
      border: :single,
      title: "NICs"
    }

    nics_labels =
      for {n, i} <- Enum.with_index(nics.list) do
        %{
          type: :label,
          x: ox + 2,
          y: oy + 3 + i,
          width: 8,
          background: :black,
          foreground: :white,
          inverse: nic == n,
          text: n
        }
      end

    config_window = %{
      type: :window,
      x: ox + 14,
      y: oy + 2,
      width: 48,
      height: 16,
      background: :black,
      foreground: :white,
      border: :single,
      title: "NIC Configuration"
    }

    # layers =
    #   case nic do
    #     nil ->
    #       layers

    #     @eth0 ->
    #       nil
    #   end

    error_label = %{
      type: :label,
      x: ox,
      y: oy + 20,
      width: width,
      background: :red,
      foreground: :white,
      text: error
    }

    layers = [title_label]
    layers = [nics_window | layers]
    layers = nics_labels ++ layers
    layers = [config_window | layers]

    layers =
      case error do
        nil -> layers
        _ -> [error_label | layers]
      end

    :lists.reverse(layers)
  end

  def execute({:get, nic}) do
    VintageLib.get_configuration(nic)
  end
end
