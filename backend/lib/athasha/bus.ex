defmodule Athasha.Bus do
  alias Athasha.Spec
  alias Athasha.Raise

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    Registry.start_link(keys: :duplicate, name: __MODULE__)
  end

  def register(event, rargs \\ nil) do
    Registry.register(__MODULE__, event, rargs)
  end

  def register!(event, rargs \\ nil) do
    case register(event, rargs) do
      {:ok, _} -> :ok
      {:error, reason} -> Raise.error({__ENV__.function, {event, rargs}, reason})
    end
  end

  def dispatch(event, dargs \\ nil) do
    Registry.dispatch(__MODULE__, event, fn entries ->
      for {pid, rargs} <- entries, do: send(pid, {event, rargs, dargs})
    end)
  end

  def dispatch!(event, dargs \\ nil) do
    :ok = dispatch(event, dargs)
  end
end
