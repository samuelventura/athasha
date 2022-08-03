defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.App
  alias AthashaTerminal.VintageLib
  alias AthashaTerminal.VintageNics
  alias AthashaTerminal.VintageConf

  def init(opts) do
    size = Keyword.fetch!(opts, :size)

    {nics, nic} = App.init(VintageNics, focus: true)
    {conf, nil} = App.init(VintageConf, focus: false)

    state = %{
      origin: {2, 1},
      size: size,
      focus: :nics,
      nics: nics,
      conf: conf,
      error: nil
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

      {:nic, nic} ->
        {state, [{:get, nic}]}

      {:conf, conf} ->
        {state, [{:conf, conf}]}
    end
  end

  def update(state, {:cmd, {:get, nic}, res}) do
    {state, error} = App.kupdate(state, :conf, {:nic, nic, res})

    case error do
      nil ->
        state = %{state | error: nil}
        {state, []}

      other ->
        state = %{state | error: "#{inspect(other)}"}
        {state, []}
    end
  end

  def update(state, _event), do: {state, []}

  def render(state, _opts \\ []) do
    %{
      origin: {ox, oy},
      size: {width, _height},
      nics: nics,
      conf: conf,
      error: error
    } = state

    nx = ox
    ny = oy + 2
    nw = 12
    nh = 4
    cx = ox + 14
    cy = oy + 2
    cw = 48
    ch = 16
    ex = ox
    ey = cy + ch
    ew = width

    title_label = %{
      type: :label,
      x: ox,
      y: oy,
      width: width,
      background: :black,
      foreground: :white,
      text: "Network Settings"
    }

    nics_window = App.render(nics, size: {nw, nh}, origin: {nx, ny})

    conf_window = App.render(conf, size: {cw, ch}, origin: {cx, cy})

    error_label = %{
      type: :label,
      x: ex,
      y: ey,
      width: ew,
      background: :red,
      foreground: :white,
      text: error
    }

    layers = [title_label]
    layers = :lists.reverse(nics_window) ++ layers
    layers = :lists.reverse(conf_window) ++ layers

    layers =
      case error do
        nil -> layers
        _ -> [error_label | layers]
      end

    :lists.reverse(layers)
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
