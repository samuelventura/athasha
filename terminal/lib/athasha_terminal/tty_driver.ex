defmodule AthashaTerminal.Tty do
  use AthashaTerminal.TtyConst

  @on_load :init

  def init() do
    nif = :code.priv_dir(:athasha_terminal) ++ '/native/tty_nif'
    :erlang.load_nif(nif, 0)
  end

  def tbinit() do
    :erlang.nif_error("NIF library not loaded")
  end

  def tbexit() do
    :erlang.nif_error("NIF library not loaded")
  end

  def ttyname() do
    :erlang.nif_error("NIF library not loaded")
  end

  def openpt() do
    :erlang.nif_error("NIF library not loaded")
  end

  def ptsname(_fd) do
    :erlang.nif_error("NIF library not loaded")
  end

  def linkpt(_fd, _ff) do
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

  def openvt(port, tty) do
    Port.command(port, "o#{tty};")
  end

  def get_size(port) do
    Port.command(port, "s")
    rec_size(port)
  end

  def set_cursor(port, x, y) do
    Port.command(port, "x#{x}y#{y}u")
  end

  def rec_size(port) do
    receive do
      {^port, {:data, data}} ->
        <<"s", w::binary-size(8), h::binary-size(8)>> = data
        w = String.to_integer(w, 16)
        h = String.to_integer(h, 16)
        {w, h}

      any ->
        raise "#{inspect(any)}"
    end
  end

  def rec_event(port) do
    receive do
      {^port, {:data, data}} ->
        <<"e", type::binary-size(2), mod::binary-size(2), key::binary-size(4), ch::binary-size(8),
          w::binary-size(8), h::binary-size(8), x::binary-size(8), y::binary-size(8)>> = data

        type = String.to_integer(type, 16)
        mod = String.to_integer(mod, 16)
        key = String.to_integer(key, 16)
        ch = String.to_integer(ch, 16)
        w = String.to_integer(w, 16)
        h = String.to_integer(h, 16)
        x = String.to_integer(x, 16)
        y = String.to_integer(y, 16)

        %{type: type, mod: mod, key: key, ch: ch, w: w, h: h, x: x, y: y}

      any ->
        raise "#{inspect(any)}"
    end
  end
end
