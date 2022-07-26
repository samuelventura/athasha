defmodule AthashaTerminal.AppRunner do
  alias AthashaTerminal.Tty
  alias AthashaTerminal.Term
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Render

  def start_link(mod, tty, term, opts \\ []) do
    Task.start_link(fn -> run(mod, tty, term, opts) end)
  end

  def run(mod, tty, term, opts) do
    term = Term.init(term)
    port = Tty.open(tty)
    Tty.write!(port, term.clear(:all))
    Tty.write!(port, term.hide(:cursor))
    size = query_size(port, term)
    {width, height} = size
    canvas = Canvas.new(width, height)
    {model, cmds} = mod.init(opts ++ [size: size])
    execute_cmds(mod, cmds)
    canvas = render(port, term, mod, model, canvas)
    loop(port, term, "", mod, model, canvas)
  end

  defp loop(port, term, buffer, mod, model, canvas) do
    receive do
      {^port, {:data, data}} ->
        {buffer, events} = term.append(buffer, data)
        model = apply_events(mod, model, events)
        canvas = render(port, term, mod, model, canvas)
        loop(port, term, buffer, mod, model, canvas)

      {:cmd, cmd, res} ->
        model = apply_events(mod, model, [{:cmd, cmd, res}])
        canvas = render(port, term, mod, model, canvas)
        loop(port, term, buffer, mod, model, canvas)

      other ->
        raise "#{inspect(other)}"
    end
  end

  defp apply_events(_, model, []), do: model

  defp apply_events(mod, model, [event | tail]) do
    {model, cmds} = mod.update(model, event)
    execute_cmds(mod, cmds)
    apply_events(mod, model, tail)
  end

  defp query_size(port, term) do
    query = term.query(:size)
    Tty.write!(port, query)
    data = Tty.read!(port)
    {"", [event]} = term.append("", data)
    {:resize, w, h} = event
    {w, h}
  end

  defp execute_cmds(_, []), do: nil

  defp execute_cmds(mod, [cmd | tail]) do
    execute_one(mod, cmd)
    execute_cmds(mod, tail)
  end

  defp execute_one(mod, cmd) do
    self = self()

    spawn(fn ->
      try do
        res = mod.execute(cmd)
        send(self, {:cmd, cmd, res})
      rescue
        e -> send(self, {:cmd, cmd, e})
      end
    end)
  end

  defp render(port, term, mod, model, canvas1) do
    render_diff(port, term, mod, model, canvas1)
    # render_direct(port, term, mod, model, canvas1)
  end

  defp render_diff(port, term, mod, model, canvas1) do
    layers = mod.render(model)
    %{width: width, height: height} = canvas1
    canvas2 = Canvas.new(width, height)

    canvas2 =
      for l <- layers, reduce: canvas2 do
        canvas -> Render.render(canvas, l)
      end

    diff = Canvas.diff(canvas1, canvas2)
    # do not hide cursor for empty or cursor only diffs
    case diff do
      [] ->
        canvas2

      _ ->
        diff = :lists.reverse(diff)

        diff =
          case diff do
            [{:c, _}] -> diff
            _ -> [{:c, false} | diff]
          end

        diff = Canvas.encode(term, diff)
        Tty.write!(port, diff)
        canvas2
    end
  end

  defp render_direct(port, term, mod, model, canvas1) do
    layers = mod.render(model)
    %{width: width, height: height} = canvas1
    canvas2 = Canvas.new(width, height)

    canvas2 =
      for l <- layers, reduce: canvas2 do
        canvas -> Render.render(canvas, l)
      end

    data = Canvas.encode(term, canvas2)
    data = IO.iodata_to_binary(data)
    Tty.write!(port, term.hide(:cursor))
    Tty.write!(port, data)
    canvas2
  end
end
