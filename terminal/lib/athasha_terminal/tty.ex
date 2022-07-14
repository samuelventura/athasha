defmodule AthashaTerminal.TTY do
  @doc false
  def open(args \\ []) do
    exec = :code.priv_dir(:athasha_terminal) ++ '/tty'
    Port.open({:spawn_executable, exec}, [:binary, :exit_status, packet: 2, args: args])
  end

  def chvt(port, ttyno) do
    Port.command(port, "c#{ttyno}")
  end

  def openvt(port, ttyno) do
    Port.command(port, "o#{ttyno}")
  end
end
