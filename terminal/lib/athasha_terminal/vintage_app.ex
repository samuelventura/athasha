defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.App
  alias AthashaTerminal.Label
  alias AthashaTerminal.VintageLib
  alias AthashaTerminal.VintageNics
  alias AthashaTerminal.VintageConf

  def init(opts) do
    {width, height} = Keyword.fetch!(opts, :size)
    origin = Keyword.get(opts, :origin, {2, 1})

    {orig_x, orig_y} = origin

    tx = orig_x
    ty = orig_y + 0
    nx = tx
    ny = ty + 2
    nw = 12
    nh = 4
    cx = nx + 14
    cy = ny
    cw = 48
    ch = 16
    ex = tx
    ey = cy + ch

    {nics, nic} = App.init(VintageNics, focus: true, origin: {nx, ny}, size: {nw, nh})
    {conf, nil} = App.init(VintageConf, focus: false, origin: {cx, cy}, size: {cw, ch})
    {title, nil} = App.init(Label, origin: {tx, ty}, width: width, text: "Network Settings")
    {alert, nil} = App.init(Label, origin: {ex, ey}, width: width, text: "")

    state = %{
      origin: origin,
      size: {width, height},
      focus: :nics,
      nics: nics,
      conf: conf,
      title: title,
      alert: alert
    }

    {state, [{:get, nic}]}
  end

  def update(%{focus: focus} = state, {:key, _, _} = event) do
    {state, events} = App.kupdate(state, focus, event)

    case events do
      nil ->
        {state, []}

      {:nav, _} ->
        state = navigate(state)
        {state, []}

      {:item, nic} ->
        {state, [{:get, nic}]}
    end
  end

  def update(%{alert: alert} = state, {:cmd, {:get, nic}, res}) do
    {state, error} = App.kupdate(state, :conf, {:nic, nic, res})

    case error do
      nil ->
        {alert, nil} = App.update(alert, {:text, ""})
        state = %{state | alert: alert}
        {state, nil}

      other ->
        {alert, nil} = App.update(alert, {:text, "#{inspect(other)}"})
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

  defp navigate(state) do
    %{focus: focus, nics: nics, conf: conf} = state

    case focus do
      :nics ->
        focus = :conf
        {nics, nil} = App.update(nics, {:focus, false})
        {conf, nil} = App.update(conf, {:focus, true})
        %{state | focus: focus, nics: nics, conf: conf}

      :conf ->
        focus = :nics
        {conf, nil} = App.update(conf, {:focus, false})
        {nics, nil} = App.update(nics, {:focus, true})
        %{state | focus: focus, nics: nics, conf: conf}
    end
  end
end
