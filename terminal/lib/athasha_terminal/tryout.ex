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
    Term.clear(term, :all) |> write.()

    case mouse do
      :mext ->
        Term.mouse(term, :standard) |> write.()
        Term.mouse(term, :extended) |> write.()

      :mstd ->
        Term.mouse(term, :standard) |> write.()
    end

    Term.query(term, :size) |> write.()
  end

  defp monitor_loop(term, write, read, buffer) do
    data = read.()
    {buffer, events} = Term.append(term, buffer, data)
    Enum.each(events, &monitor_handle(term, write, &1))
    IO.inspect({data, events, buffer})
    monitor_loop(term, write, read, buffer)
  end

  defp monitor_handle(term, write, event) do
    case event do
      {:key, 0, "\e"} -> monitor_showcase(term)
      {:key, 2, "`"} -> Term.query(term, :size)
      {:key, 2, "1"} -> Term.clear(term, :all)
      {:key, 2, "2"} -> Term.clear(term, :screen)
      {:key, 2, "3"} -> Term.clear(term, :styles)
      {:key, 2, "4"} -> Term.mouse(term, :standard)
      {:key, 2, "5"} -> Term.mouse(term, :extended)
      {:key, 2, "a"} -> Term.cursor(term, 0, 0)
      {:key, 2, "s"} -> Term.hide(term, :cursor)
      {:key, 2, "d"} -> Term.show(term, :cursor)
      {:key, 2, "f"} -> Term.cursor(term, :style, :blinking_block)
      {:key, 2, "g"} -> Term.cursor(term, :style, :steady_block)
      {:key, 2, "h"} -> Term.cursor(term, :style, :blinking_underline)
      {:key, 2, "j"} -> Term.cursor(term, :style, :steady_underline)
      {:key, 2, "k"} -> Term.cursor(term, :style, :blinking_bar)
      {:key, 2, "l"} -> Term.cursor(term, :style, :steady_bar)
      {:key, 2, "x"} -> Term.set(term, :bold)
      {:key, 2, "v"} -> Term.set(term, :dimmed)
      {:key, 2, "b"} -> Term.set(term, :italic)
      {:key, 2, "n"} -> Term.set(term, :underline)
      {:key, 2, "m"} -> Term.set(term, :inverse)
      {:key, 2, ","} -> Term.set(term, :crossed)
      {:key, 2, "."} -> Term.set(term, :blink)
      {:key, 2, "6"} -> Term.reset(term, :normal)
      {:key, 2, "7"} -> Term.reset(term, :italic)
      {:key, 2, "8"} -> Term.reset(term, :underline)
      {:key, 2, "9"} -> Term.reset(term, :inverse)
      {:key, 2, "0"} -> Term.reset(term, :crossed)
      {:key, 2, "-"} -> Term.reset(term, :blink)
      {:key, 0, "\r"} -> "\r\n"
      {:key, 0, k} -> k
      _ -> ""
    end
    |> write.()
  end

  defp monitor_showcase(term) do
    Term.clear(term, :all) <>
      "normal\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :bold) <>
      "bold\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :italic) <>
      "italic\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :underline) <>
      "underline\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :dimmed) <>
      "dimmed\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :crossed) <>
      "crossed\n\r" <>
      Term.clear(term, :styles) <>
      Term.set(term, :inverse) <>
      "inverse\n\r" <>
      Term.clear(term, :styles) <>
      Enum.reduce(0..255, "", fn n, acc ->
        acc <> Term.color(term, :background, n) <> " "
      end) <>
      "\n\r" <>
      Enum.reduce(0..7, "", fn n, acc ->
        acc <>
          Term.color(term, :background, n) <>
          "                " <>
          Term.color(term, :background, 0) <>
          Term.color(term, :foreground, n) <>
          " 0123456789abcdef\n\r"
      end)
  end
end
