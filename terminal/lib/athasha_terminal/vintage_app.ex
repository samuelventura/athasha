defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  alias AthashaTerminal.VintageLib
  alias AthashaTerminal.VintageNics
  alias AthashaTerminal.VintageConf

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    {nics, nic} = VintageNics.init(focus: true)
    conf = VintageConf.init(focus: false)

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

  def update(%{focus: :nics} = state, {:key, _, :arrow_down} = event) do
    %{nics: nics} = state
    {nics, nic} = VintageNics.update(nics, event)
    state = %{state | nics: nics}
    {state, [{:get, nic}]}
  end

  def update(%{focus: :nics} = state, {:key, _, :arrow_up} = event) do
    %{nics: nics} = state
    {nics, nic} = VintageNics.update(nics, event)
    state = %{state | nics: nics}
    {state, [{:get, nic}]}
  end

  def update(state, {:cmd, {:get, nic}, res}) do
    %{nics: nics, conf: conf} = state
    {conf, error} = VintageConf.update(conf, {:nic, nic, res})

    case error do
      nil ->
        nics = VintageNics.update(nics, {:nic, nic})
        state = %{state | conf: conf, nics: nics}
        {state, []}

      other ->
        state = %{state | conf: conf, error: "#{inspect(other)}"}
        {state, []}
    end
  end

  def update(state, {:key, 0, "\t"}) do
    %{focus: focus, nics: nics, conf: conf} = state

    state =
      case focus do
        :nics ->
          focus = :conf
          nics = VintageNics.update(nics, {:focus, false})
          conf = VintageConf.update(conf, {:focus, true})
          %{state | focus: focus, nics: nics, conf: conf}

        :conf ->
          focus = :nics
          conf = VintageConf.update(conf, {:focus, false})
          nics = VintageNics.update(nics, {:focus, true})
          %{state | focus: focus, nics: nics, conf: conf}
      end

    {state, []}
  end

  def update(state, _event), do: {state, []}

  def render(state) do
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

    nics_window = VintageNics.render(nics, size: {nw, nh}, origin: {nx, ny})

    conf_window = VintageConf.render(conf, size: {cw, ch}, origin: {cx, cy})

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
end
