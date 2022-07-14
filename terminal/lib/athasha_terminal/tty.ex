defmodule AthashaTerminal.TTY do
  @on_load :init

  def init() do
    nif = :code.priv_dir(:athasha_terminal) ++ '/native/tty_nif'
    :erlang.load_nif(nif, 0)
  end

  def open(args \\ []) do
    exec = :code.priv_dir(:athasha_terminal) ++ '/native/tty_port'
    Port.open({:spawn_executable, exec}, [:binary, :exit_status, packet: 2, args: args])
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

  def ttyname() do
    :erlang.nif_error("NIF library not loaded")
  end
end
