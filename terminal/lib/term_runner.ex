defmodule AthashaTerminal.Runner do
  defmacro __using__(term: term_module, tty: tty_module, app: app_module) do
    quote do
      use AthashaTerminal.Tty, module: unquote(tty_module)
      use AthashaTerminal.Term, module: unquote(term_module)

      alias AthashaTerminal.Canvas
      import unquote(app_module)

      def start_link(tty, app) do
        Task.start_link(fn -> run(tty, app) end)
      end

      def run(tty, app) do
        tty = tty_open(tty)
        init(tty)
        size = query_size(tty)
        {width, height} = size
        canvas = Canvas.new(width, height)
        {app, cmd} = app_init(size: size)
        execute_cmd(app, cmd)
        canvas = render(tty, app, canvas)
        loop(tty, "", app, canvas)
      end

      # code cursor not shown under inverse
      # setup code cursor to linux default
      defp init(tty) do
        tty_write!(tty, [
          term_clear(:all),
          term_hide(:cursor),
          # term_mouse(:standard),
          # term_mouse(:extended),
          term_cursor(:style, :blinking_underline)
        ])
      end

      defp loop(tty, buffer, app, canvas) do
        receive do
          {:tty, :data, data} ->
            IO.inspect(data)
            {buffer, events} = term_append(buffer, data)
            IO.inspect(events)
            app = apply_events(app, events)

            # glitch on horizontal resize because of auto line wrapping
            canvas =
              case find_resize(events) do
                nil ->
                  canvas

                {:resize, width, height} ->
                  init(tty)
                  Canvas.new(width, height)
              end

            canvas = render(tty, app, canvas)
            loop(tty, buffer, app, canvas)

          {:cmd, cmd, res} ->
            app = apply_event(app, {:cmd, cmd, res})
            canvas = render(tty, app, canvas)
            loop(tty, buffer, app, canvas)

          other ->
            raise "#{inspect(other)}"
        end
      end

      defp apply_events(app, []), do: app

      defp apply_events(app, [event | tail]) do
        app = apply_event(app, event)
        apply_events(app, tail)
      end

      defp apply_event(app, event) do
        {app, cmd} = app_handle(app, event)
        execute_cmd(app, cmd)
        app
      end

      defp find_resize(events) do
        Enum.find(events, fn event ->
          case event do
            {:resize, _, _} -> true
            _ -> false
          end
        end)
      end

      defp query_size(tty) do
        query = term_query(:size)
        tty_write!(tty, query)
        data = tty_read!(tty)
        {"", [event]} = term_append("", data)
        {:resize, w, h} = event
        {w, h}
      end

      defp execute_cmd(_, nil), do: nil

      defp execute_cmd(_app, cmd) do
        self = self()

        spawn(fn ->
          try do
            res = app_execute(cmd)
            send(self, {:cmd, cmd, res})
          rescue
            e ->
              send(self, {:cmd, cmd, e})
          end
        end)
      end

      defp render(tty, app, canvas1) do
        {width, size} = Canvas.get(canvas1, :size)
        canvas2 = Canvas.new(width, size)
        canvas2 = app_render(app, canvas2)
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
            data = term_encode(diff)
            data = IO.iodata_to_binary(data)
            IO.inspect(data)
            tty_write!(tty, data)
            canvas2
        end
      end
    end
  end
end
