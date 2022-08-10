defmodule AthashaTerminal.AppRunner do
  alias AthashaTerminal.Tty
  alias AthashaTerminal.Term
  alias AthashaTerminal.Canvas

  def child_spec(params) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [params.mod, params.tty, params.term, params.opts]}
    }
  end

  def start_link(mod, tty, term, opts \\ []) do
    Task.start_link(fn -> run(mod, tty, term, opts) end)
  end

  def run(mod, tty, term, opts) do
    if Tty.target() != :host do
      [^tty, ns] = Regex.run(~r"/dev/tty(\d+)", tty)
      Tty.chvt(ns)
    end

    # wait for deps before size query
    deps = mod.deps(opts)
    term = Term.init(term)
    port = Tty.open(tty)
    init(port, term)
    size = query_size(port, term)
    {width, height} = size
    canvas = Canvas.new(width, height)
    {model, cmd} = mod.init(opts ++ [size: size, deps: deps])
    execute_cmd(mod, cmd)
    canvas = render(port, term, mod, model, canvas)
    loop(port, term, "", mod, model, canvas)
  end

  # code cursor not shown under inverse
  # setup code cursor to linux default
  defp init(port, term) do
    Tty.write!(port, [
      term.clear(:all),
      term.hide(:cursor),
      term.mouse(:standard),
      term.mouse(:extended),
      term.cursor(:style, :blinking_underline)
    ])
  end

  defp loop(port, term, buffer, mod, model, canvas) do
    receive do
      {^port, {:data, data}} ->
        # IO.inspect(data)
        {buffer, events} = term.append(buffer, data)
        # IO.inspect(events)
        model = apply_events(mod, model, events)

        # glitch on horizontal resize because of auto line wrapping
        canvas =
          case find_resize(events) do
            nil ->
              canvas

            {:resize, width, height} ->
              init(port, term)
              Canvas.new(width, height)
          end

        canvas = render(port, term, mod, model, canvas)
        loop(port, term, buffer, mod, model, canvas)

      {:cmd, cmd, res} ->
        model = apply_event(mod, model, {:cmd, cmd, res})
        canvas = render(port, term, mod, model, canvas)
        loop(port, term, buffer, mod, model, canvas)

      other ->
        raise "#{inspect(other)}"
    end
  end

  defp apply_events(_, model, []), do: model

  defp apply_events(mod, model, [event | tail]) do
    model = apply_event(mod, model, event)
    apply_events(mod, model, tail)
  end

  defp apply_event(mod, model, event) do
    {model, cmd} = mod.handle(model, event)
    execute_cmd(mod, cmd)
    model
  end

  defp find_resize(events) do
    Enum.find(events, fn event ->
      case event do
        {:resize, _, _} -> true
        _ -> false
      end
    end)
  end

  defp query_size(port, term) do
    query = term.query(:size)
    Tty.write!(port, query)
    data = Tty.read!(port)
    {"", [event]} = term.append("", data)
    {:resize, w, h} = event
    {w, h}
  end

  defp execute_cmd(_, nil), do: nil

  defp execute_cmd(mod, cmd) do
    self = self()

    spawn(fn ->
      try do
        res = mod.execute(cmd)
        send(self, {:cmd, cmd, res})
      rescue
        e ->
          send(self, {:cmd, cmd, e})
      end
    end)
  end

  defp render(port, term, mod, model, canvas1) do
    {width, size} = Canvas.get(canvas1, :size)
    canvas2 = Canvas.new(width, size)
    canvas2 = mod.render(model, canvas2)
    {cursor1, _, _} = Canvas.get(canvas1, :cursor)
    {cursor2, _, _} = Canvas.get(canvas2, :cursor)
    diff = Canvas.diff(canvas1, canvas2)
    # do not hide cursor for empty or cursor only diffs
    # hide cursor before write or move and then restore
    diff =
      case diff do
        [] ->
          diff

        [{:c, _}] ->
          diff

        _ ->
          case {cursor1, cursor2} do
            {true, true} ->
              diff = [{:c, true} | diff]
              diff = :lists.reverse(diff)
              [{:c, false} | diff]

            {true, false} ->
              diff = :lists.reverse(diff)
              [{:c, false} | diff]

            _ ->
              :lists.reverse(diff)
          end
      end

    case diff do
      [] ->
        canvas2

      _ ->
        data = Canvas.encode(term, diff)
        data = IO.iodata_to_binary(data)
        # IO.inspect(data)
        Tty.write!(port, data)
        canvas2
    end
  end
end
