defmodule AthashaTerminal.AppRunner do
  alias AthashaTerminal.Tty
  alias AthashaTerminal.Term
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Render

  # @method :direct
  @method :diff

  def start_link(mod, tty, term, opts \\ []) do
    Task.start_link(fn -> run(mod, tty, term, opts) end)
  end

  def run(mod, tty, term, opts) do
    term = Term.init(term)
    port = Tty.open(tty)
    init(port, term)
    size = query_size(port, term)
    {width, height} = size
    canvas = Canvas.new(width, height)
    {model, cmds} = mod.init(opts ++ [size: size])
    execute_cmds(mod, cmds)
    canvas = render(port, term, mod, model, canvas)
    loop(port, term, "", mod, model, canvas)
  end

  defp init(port, term) do
    Tty.write!(port, [
      term.clear(:all),
      term.hide(:cursor),
      term.mouse(:standard),
      term.mouse(:extended)
    ])
  end

  defp loop(port, term, buffer, mod, model, canvas) do
    receive do
      {^port, {:data, data}} ->
        {buffer, events} = term.append(buffer, data)
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
    layers = mod.render(model)

    {canvas2, data} =
      case @method do
        :diff -> render_diff(term, layers, canvas1)
        :direct -> render_direct(term, layers, canvas1)
      end

    case data do
      nil ->
        canvas2

      _ ->
        data = IO.iodata_to_binary(data)
        Tty.write!(port, data)
        canvas2
    end
  end

  def render_diff(term, layers, canvas1) do
    %{width: width, height: height} = canvas1
    canvas2 = Canvas.new(width, height)

    canvas2 =
      for l <- layers, reduce: canvas2 do
        canvas -> Render.render(canvas, l)
      end

    %{cursor: cursor2} = canvas2
    diff = Canvas.diff(canvas1, canvas2)
    # do not hide cursor for empty or cursor only diffs
    # hide cursor before write or move and then restore
    case diff do
      [] ->
        {canvas2, nil}

      _ ->
        diff =
          case diff do
            [{:c, _}] ->
              :lists.reverse(diff)

            _ ->
              diff =
                case cursor2 do
                  true -> [{:c, true} | diff]
                  _ -> diff
                end

              diff = :lists.reverse(diff)
              [{:c, false} | diff]
          end

        diff = Canvas.encode(term, diff)
        {canvas2, diff}
    end
  end

  def render_direct(term, layers, canvas1) do
    %{width: width, height: height} = canvas1
    canvas2 = Canvas.new(width, height)

    canvas2 =
      for l <- layers, reduce: canvas2 do
        canvas -> Render.render(canvas, l)
      end

    data = Canvas.encode(term, canvas2)
    data = [term.hide(:cursor) | data]
    {canvas2, data}
  end
end
