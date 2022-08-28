defmodule AthashaTerminal.Tty do
  @callback tty_open(opts :: any()) :: any()
  @callback tty_read!(tty :: any()) :: {any(), any()}
  @callback tty_write!(tty :: any(), data :: any()) :: any()
  @callback tty_close(tty :: any()) :: :ok

  defmacro __using__(module: module) do
    quote do
      import unquote(module)

      def tty_poll(tty) do
        pid = self()
        Task.start_link(fn -> tty_run(tty, pid) end)
      end

      defp tty_run(tty, pid) do
        {tty, data} = unquote(module).tty_read!(tty)
        send(pid, {:tty, :data, data})
        tty_run(tty, pid)
      end
    end
  end
end
