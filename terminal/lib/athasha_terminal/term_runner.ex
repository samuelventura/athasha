defmodule AthashaTerminal.AppRunner do
  alias AthashaTerminal.Tty
  alias AthashaTerminal.Term

  def start_link(mod, tty, term, opts \\ []) do
    Task.start_link(fn -> run(mod, tty, term, opts) end)
  end

  def run(mod, tty, term, opts) do
    port = Tty.open(tty)
    size = query_size(port, term)
    model = mod.init(opts ++ [size: size])
    render(port, term, mod, model)
    loop(port, term, "", mod, model)
  end

  defp loop(port, term, buffer, mod, model) do
    receive do
      {^port, {:data, data}} ->
        {buffer, events} = Term.append(term, buffer, data)
        model = Enum.reduce(events, model, &mod.update(&2, &1))
        render(port, term, mod, model)
        loop(port, term, buffer, mod, model)

      other ->
        raise "#{inspect(other)}"
    end
  end

  defp query_size(port, term) do
    query = Term.query(term, :size)
    Tty.write!(port, query)
    data = Tty.read!(port)
    {"", [event]} = Term.append(term, "", data)
    {:resize, w, h} = event
    {w, h}
  end

  defp tty_write(data, port) do
    IO.inspect({port, data})
    Tty.write!(port, data)
  end

  defp render(port, term, mod, model) do
    Term.clear(term, :all) |> tty_write(port)
    Term.hide(term, :cursor) |> tty_write(port)
    layers = mod.render(model)
    Enum.each(layers, &render(port, term, &1))
  end

  defp render(port, term, {:window, x, y, w, h, color}) do
    Term.color(term, :foreground, color) |> tty_write(port)
    Term.color(term, :background, color) |> tty_write(port)

    Enum.each(0..h, fn r ->
      Term.cursor(term, 1 + y + r, 1 + x) |> tty_write(port)
      String.duplicate(" ", w) |> tty_write(port)
    end)
  end
end
