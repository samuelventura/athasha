defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.VintageLib

  def init(opts) do
    nics = ["eth0", "wlan0"]
    next = %{nil => "eth0", "wlan0" => "eth0", "eth0" => "wlan0"}
    prev = %{nil => "wlan0", "wlan0" => "eth0", "eth0" => "wlan0"}

    {%{
       size: Keyword.fetch!(opts, :size),
       nics: %{list: nics, next: next, prev: prev},
       focus: :nics,
       nic: nil,
       conf: nil,
       error: nil
     }, [{:get, "eth0"}]}
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
    %{nics: nics, nic: selected} = state

    layers = [
      %{
        type: :window,
        x: 0,
        y: 0,
        width: 12,
        height: 4,
        background: :white,
        foreground: :black,
        border: :double,
        title: "NICs"
      }
    ]

    layers =
      for {nic, i} <- Enum.with_index(nics.list), reduce: layers do
        layers ->
          [
            %{
              type: :label,
              x: 2,
              y: 1 + i,
              width: 8,
              background: :white,
              foreground: :black,
              inverse: selected == nic,
              text: nic
            }
            | layers
          ]
      end

    :lists.reverse(layers)
  end

  def execute({:get, nic}) do
    VintageLib.get_configuration(nic)
  end
end
