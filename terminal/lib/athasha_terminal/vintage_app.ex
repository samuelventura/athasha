defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.App
  alias AthashaTerminal.Label
  alias AthashaTerminal.VintageLib
  alias AthashaTerminal.VintageNics
  alias AthashaTerminal.VintageConf

  def init(opts) do
    {width, height} = Keyword.fetch!(opts, :size)
    origin = Keyword.get(opts, :origin, {0, 0})

    {orig_x, orig_y} = origin

    tx = orig_x
    ty = orig_y + 0
    nx = tx
    ny = ty + 2
    nw = 12
    nh = 6
    cx = nx + 14
    cy = ny
    cw = 32
    ch = 16
    ex = tx
    ey = height - 1

    {nics, nic} = App.init(VintageNics, focus: true, origin: {nx, ny}, size: {nw, nh})
    {conf, nil} = App.init(VintageConf, focus: false, origin: {cx, cy}, size: {cw, ch})
    {title, nil} = App.init(Label, origin: {tx, ty}, width: width, text: "Network Settings")
    {alert, nil} = App.init(Label, origin: {ex, ey}, width: width, text: "", fgcolor: :white)

    state = %{
      origin: origin,
      size: {width, height},
      active: :nics,
      nics: nics,
      conf: conf,
      title: title,
      alert: alert
    }

    {state, [{:get, nic}]}
  end

  def update(%{active: active} = state, {:key, _, _} = event) do
    {state, events} = App.kupdate(state, active, event)

    case {active, events} do
      {_, nil} ->
        {state, []}

      {_, {:focus, _}} ->
        state = navigate(state)
        {state, []}

      {:nics, {:item, nic}} ->
        {state, [{:get, nic}]}

      {:conf, {:save, conf}} ->
        {state, [{:save, conf}]}
    end
  end

  def update(%{alert: alert} = state, {:cmd, {:get, nic}, res}) do
    {state, error} = App.kupdate(state, :conf, {:nic, nic, res})

    case error do
      nil ->
        {alert, nil} = App.update(alert, {:bgcolor, :black})
        {alert, nil} = App.update(alert, {:text, ""})
        state = %{state | alert: alert}
        {state, nil}

      other ->
        {alert, nil} = App.update(alert, {:bgcolor, :red})
        {alert, nil} = App.update(alert, {:text, "#{inspect(other)}"})
        state = %{state | alert: alert}
        {state, nil}
    end
  end

  def update(%{alert: alert} = state, {:cmd, {:save, _conf}, res}) do
    case res do
      :ok ->
        {alert, nil} = App.update(alert, {:bgcolor, :bblue})
        {alert, nil} = App.update(alert, {:text, "Config saved successfully"})
        state = %{state | alert: alert}
        {state, nil}

      {:error, error} ->
        {alert, nil} = App.update(alert, {:bgcolor, :red})
        {alert, nil} = App.update(alert, {:text, "#{inspect(error)}"})
        state = %{state | alert: alert}
        {state, nil}
    end
  end

  def update(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      alert: alert,
      title: title,
      nics: nics,
      conf: conf
    } = state

    canvas = App.render(title, canvas)
    canvas = App.render(alert, canvas)
    canvas = App.render(nics, canvas)
    canvas = App.render(conf, canvas)
    canvas
  end

  def execute({:get, nic}) do
    mac = VintageLib.get_mac!(nic)
    mac = MACAddress.to_hex(mac)
    config = VintageLib.get_configuration(nic)
    Map.put(config, :mac, mac)
  end

  def execute({:save, conf}) do
    IO.inspect(conf)
    :ok
  end

  defp navigate(state) do
    %{active: active} = state
    {state, _} = App.kupdate(state, active, {:focus, false})
    active = next(active)
    {state, _} = App.kupdate(state, active, {:focus, true})
    %{state | active: active}
  end

  defp next(:nics), do: :conf
  defp next(:conf), do: :nics
end
