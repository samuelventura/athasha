defmodule AthashaTerminal.Tty do
  @on_load :init

  def init() do
    nif = :code.priv_dir(:athasha_terminal) ++ '/native/tty_nif'
    :erlang.load_nif(nif, 0)
  end

  def openpt() do
    :erlang.nif_error("NIF library not loaded")
  end

  def linkpt(_ff) do
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

  def recv_data!(port) do
    receive do
      {^port, {:data, data}} ->
        data

      any ->
        raise "#{inspect(any)}"
    end
  end
end
