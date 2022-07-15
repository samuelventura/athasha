defmodule AthashaTerminal.Tty do
  use AthashaTerminal.TtyConst

  @on_load :init

  def init() do
    nif = :code.priv_dir(:athasha_terminal) ++ '/native/tty_nif'
    :erlang.load_nif(nif, 0)
  end

  def ttyname() do
    :erlang.nif_error("NIF library not loaded")
  end

  def open(args \\ []) do
    exec = :code.priv_dir(:athasha_terminal) ++ '/native/tty_port'
    opts = [:binary, :exit_status, packet: 2, args: args]
    Port.open({:spawn_executable, exec}, opts)
  end

  def close(port) do
    Port.close(port)
  end

  def chvt(port, ttyno) do
    Port.command(port, "c#{ttyno}")
  end

  def openvt(port, tty) when is_integer(tty) do
    Port.command(port, "o#{tty}")
  end

  def openvt(port, tty) when is_binary(tty) do
    Port.command(port, "O#{tty};")
  end

  def get_size(port) do
    Port.command(port, "s")
    rec_size(port)
  end

  def set_cursor(port, x, y) do
    Port.command(port, "x#{x}y#{y}u")
  end

  def default() do
    port =
      case Application.get_env(:athasha_terminal, :target) do
        :host ->
          port = open()
          tty = ttyname() |> to_string()
          openvt(port, tty)

        _ ->
          port = open(["c2"])
          openvt(port, 2)
          port
      end

    {w, h} = rec_size(port)
    {port, w, h}
  end

  defp rec_size(port) do
    receive do
      {^port, {:data, data}} ->
        <<"s", w::binary-size(8), h::binary-size(8)>> = data
        w = Base.decode16!(w)
        h = Base.decode16!(h)
        {w, h}
    end
  end

  defp rec_event(port) do
    receive do
      {^port, {:data, data}} ->
        <<"e", type::binary-size(2), mod::binary-size(2), key::binary-size(4), ch::binary-size(8),
          w::binary-size(8), h::binary-size(8), x::binary-size(8), y::binary-size(8)>> = data

        type = Base.decode16!(type)
        mod = Base.decode16!(mod)
        key = Base.decode16!(key)
        ch = Base.decode16!(ch)
        w = Base.decode16!(w)
        h = Base.decode16!(h)
        x = Base.decode16!(x)
        y = Base.decode16!(y)

        %{type: type, mod: mod, key: key, ch: ch, w: w, h: h, x: x, y: y}
    end
  end
end
