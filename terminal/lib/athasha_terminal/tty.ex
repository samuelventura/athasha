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

  def export_start_link(tty, port) do
    Task.start_link(fn -> export_run(tty, port) end)
  end

  def export_run(tty, port) do
    opts = [
      :binary,
      ip: {0, 0, 0, 0},
      packet: :raw,
      active: true,
      reuseaddr: true
    ]

    {:ok, listener} = :gen_tcp.listen(port, opts)
    {:ok, socket} = :gen_tcp.accept(listener)
    port = open(tty)
    export_loop(listener, port, socket)
  end

  defp export_loop(listener, port, socket) do
    receive do
      {:tcp, _, data} ->
        write!(port, data)
        export_loop(listener, port, socket)

      {^port, {:data, data}} ->
        :gen_tcp.send(socket, data)
        export_loop(listener, port, socket)

      {:tcp_closed, _} ->
        {:ok, socket} = :gen_tcp.accept(listener)
        export_loop(listener, port, socket)

      any ->
        raise "#{inspect(any)}"
    end
  end
end
