defmodule Athasha.Registry do
  alias Athasha.Spec

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    Registry.start_link(keys: :duplicate, name: __MODULE__)
  end

  def register(event, rargs \\ nil) do
    Registry.register(__MODULE__, event, rargs)
  end

  def dispatch(event, dargs \\ nil) do
    Registry.dispatch(__MODULE__, event, fn entries ->
      for {pid, rargs} <- entries, do: send(pid, {event, rargs, dargs})
    end)
  end
end
