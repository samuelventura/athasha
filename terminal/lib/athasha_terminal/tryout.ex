defmodule AthashaTerminal.Tryout do
  alias AthashaTerminal.Tty
  alias AthashaTerminal.Term

  def run(file) do
    exec = fn -> Code.eval_file(file) end
    run_exec(exec)
  end

  def run(mod, fun, args) do
    exec = fn -> apply(mod, fun, args) end
    run_exec(exec)
  end

  defp run_exec(exec) do
    pid0 = self()

    pid1 =
      spawn_link(fn ->
        try do
          exec.()
        rescue
          e ->
            IO.inspect("#{inspect(e)} #{__STACKTRACE__}")
        end

        send(pid0, :done)
      end)

    pid2 =
      spawn_link(fn ->
        IO.gets("Press ENTER to stop>")
        send(pid0, :enter)
      end)

    receive do
      _ ->
        Process.exit(pid1, :kill)
        Process.exit(pid2, :kill)
    end
  end

  def export(tty, port) do
    opts = [
      :binary,
      ip: {0, 0, 0, 0},
      packet: :raw,
      active: true,
      reuseaddr: true
    ]

    {:ok, listener} = :gen_tcp.listen(port, opts)
    {:ok, socket} = :gen_tcp.accept(listener)
    port = Tty.open(tty)
    export_loop(listener, port, socket)
  end

  defp export_loop(listener, port, socket) do
    receive do
      {:tcp, _, data} ->
        Tty.write!(port, data)
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

  def monitor(term, tty, mouse) do
    port = Tty.open(tty)
    read = fn -> Tty.read!(port) end
    write = fn data -> Tty.write!(port, data) end
    monitor_init(term, write, mouse)
    monitor_loop(term, read, "")
  end

  def monitor(term, host, port, mouse) do
    host = String.to_charlist(host)
    {:ok, socket} = :gen_tcp.connect(host, port, [:binary, active: false])

    read = fn ->
      case :gen_tcp.recv(socket, 0) do
        {:ok, data} ->
          data

        any ->
          raise "#{inspect(any)}"
      end
    end

    write = fn data -> :ok = :gen_tcp.send(socket, data) end
    monitor_init(term, write, mouse)
    monitor_loop(term, read, "")
  end

  defp monitor_init(_term, write, mouse) do
    # full reset
    write.("\ec")

    case mouse do
      :mext ->
        # enable mouse extended
        write.("\e[?1006h")
        write.("\e[?1000h")

      :mstd ->
        # enable mouse standard
        write.("\e[?1000h")
    end

    # query window size
    write.("\e[s\e[999;999H\e[6n\e[u")
  end

  defp monitor_loop(term, read, buffer) do
    data = read.()
    {buffer, events} = Term.append(term, buffer, data)
    IO.inspect({data, events, buffer})
    monitor_loop(term, read, buffer)
  end
end
