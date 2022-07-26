defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.VintageLib

  def init(opts) do
    {%{
       size: Keyword.fetch!(opts, :size),
       nics: ["eth0", "wlan0"],
       nic: "eth0",
       conf: nil,
       error: nil
     }, [{:get, "eth0"}]}
  end

  def update(state, {:cmd, {:get, nic}, res}) do
    case res do
      %{ipv4: conf, type: VintageNetEthernet} ->
        state = %{state | conf: conf, nic: nic}
        {state, []}

      other ->
        state = %{state | error: "#{inspect(other)}"}
        {state, []}
    end
  end

  def update(state, _) do
    {state, []}
  end

  def render(_state) do
    [
      %{
        type: :window,
        x: 0,
        y: 0,
        width: 20,
        height: 3,
        background: :white,
        foreground: :black,
        border: :double,
        title: "Network Settings"
      }
    ]
  end

  def execute({:get, nic}) do
    VintageLib.get_configuration(nic)
  end
end
