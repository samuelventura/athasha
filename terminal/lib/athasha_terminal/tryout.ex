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
    term = Term.init(term)
    port = Tty.open(tty)
    read = fn -> Tty.read!(port) end
    write = fn data -> Tty.write!(port, data) end
    monitor_init(term, write, mouse)
    monitor_loop(term, write, read, "")
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
    monitor_loop(term, write, read, "")
  end

  defp monitor_init(term, write, mouse) do
    term.clear(:all) |> write.()

    case mouse do
      :mext ->
        term.mouse(:standard) |> write.()
        term.mouse(:extended) |> write.()

      :mstd ->
        term.mouse(:standard) |> write.()
    end

    term.query(:size) |> write.()
  end

  defp monitor_loop(term, write, read, buffer) do
    data = read.()
    {buffer, events} = term.append(buffer, data)
    Enum.each(events, &monitor_handle(term, write, &1))
    IO.inspect({data, events, buffer})
    monitor_loop(term, write, read, buffer)
  end

  defp monitor_handle(term, write, event) do
    case event do
      {:key, 0, "\e"} -> monitor_showcase(term)
      {:key, 2, "`"} -> term.query(:size)
      {:key, 2, "1"} -> term.clear(:all)
      {:key, 2, "2"} -> term.clear(:screen)
      {:key, 2, "3"} -> term.clear(:styles)
      {:key, 2, "4"} -> term.mouse(:standard)
      {:key, 2, "5"} -> term.mouse(:extended)
      {:key, 2, "a"} -> term.cursor(0, 0)
      {:key, 2, "s"} -> term.hide(:cursor)
      {:key, 2, "d"} -> term.show(:cursor)
      {:key, 2, "f"} -> term.cursor(:style, :blinking_block)
      {:key, 2, "g"} -> term.cursor(:style, :steady_block)
      {:key, 2, "h"} -> term.cursor(:style, :blinking_underline)
      {:key, 2, "j"} -> term.cursor(:style, :steady_underline)
      {:key, 2, "k"} -> term.cursor(:style, :blinking_bar)
      {:key, 2, "l"} -> term.cursor(:style, :steady_bar)
      {:key, 2, "x"} -> term.set(:bold)
      {:key, 2, "v"} -> term.set(:dimmed)
      {:key, 2, "b"} -> term.set(:italic)
      {:key, 2, "n"} -> term.set(:underline)
      {:key, 2, "m"} -> term.set(:inverse)
      {:key, 2, ","} -> term.set(:crossed)
      {:key, 2, "."} -> term.set(:blink)
      {:key, 2, "6"} -> term.reset(:normal)
      {:key, 2, "7"} -> term.reset(:italic)
      {:key, 2, "8"} -> term.reset(:underline)
      {:key, 2, "9"} -> term.reset(:inverse)
      {:key, 2, "0"} -> term.reset(:crossed)
      {:key, 2, "-"} -> term.reset(:blink)
      {:key, 0, "\r"} -> "\r\n"
      {:key, 0, k} -> k
      _ -> ""
    end
    |> write.()
  end

  defp monitor_showcase(term) do
    term.clear(:all) <>
      "normal\n\r" <>
      term.clear(:styles) <>
      term.set(:bold) <>
      "bold\n\r" <>
      term.clear(:styles) <>
      term.set(:italic) <>
      "italic\n\r" <>
      term.clear(:styles) <>
      term.set(:underline) <>
      "underline\n\r" <>
      term.clear(:styles) <>
      term.set(:dimmed) <>
      "dimmed\n\r" <>
      term.clear(:styles) <>
      term.set(:crossed) <>
      "crossed\n\r" <>
      term.clear(:styles) <>
      term.set(:inverse) <>
      "inverse\n\r" <>
      term.clear(:styles) <>
      Enum.reduce(0..3, "", fn n, acc ->
        acc <>
          term.cursor(9 + n, 0) <>
          Enum.reduce(0..63, "", fn m, acc ->
            acc <> term.color(:background, 64 * n + m) <> " "
          end)
      end) <>
      "\n\r" <>
      Enum.reduce(0..7, "", fn n, acc ->
        acc <>
          term.color(:background, n) <>
          "                " <>
          term.color(:background, 0) <>
          term.color(:foreground, n) <>
          " 0123456789abcdef\n\r"
      end) <>
      term.clear(:styles) <>
      Enum.reduce(0..120, "", fn n, acc ->
        acc <>
          term.cursor(n, 70) <>
          "#{n}"
      end)
  end
end
