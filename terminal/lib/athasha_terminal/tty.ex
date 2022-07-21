defmodule AthashaTerminal.Tty do
  def open(tty) do
    exec = :code.priv_dir(:athasha_terminal) ++ '/native/tty_slave'
    opts = [:binary, :exit_status, :stream, args: [tty]]
    Port.open({:spawn_executable, exec}, opts)
  end

  def close(port) do
    Port.close(port)
  end

  def read!(port) do
    receive do
      {^port, {:data, data}} ->
        data

      any ->
        raise "#{inspect(any)}"
    end
  end

  def write!(port, data) do
    true = Port.command(port, data)
  end

  def chvt(tn) do
    exec = :code.priv_dir(:athasha_terminal) ++ '/native/tty_chvt'
    System.cmd("#{exec}", ["#{tn}"])
  end

  def target() do
    Application.get_env(:athasha_terminal, :target)
  end

  def exit() do
    # exit from nerves shell (works in host as well)
    Process.exit(Process.group_leader(), :kill)
  end
end
