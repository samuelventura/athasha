defmodule AthashaTerminal.AppRunner do
  alias AthashaTerminal.Tty
  use GenServer

  def start_link(mod, tty, opts) do
    GenServer.start_link(__MODULE__, {mod, tty, opts})
  end

  def init({mod, tty, opts}) do
    port = Tty.open(tty)
    state = mod.init(opts)
    {:ok, {mod, port, state}}
  end
end
