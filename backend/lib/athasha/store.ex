defmodule Athasha.Store do
  alias Athasha.Spec
  alias Athasha.Raise

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    Registry.start_link(keys: :unique, name: __MODULE__)
  end

  def register(key, args \\ nil) do
    Registry.register(__MODULE__, key, args)
  end

  def register!(key, args \\ nil) do
    case register(key, args) do
      {:ok, _} -> :ok
      {:error, reason} -> Raise.error({__ENV__.function, {key, args}, reason})
    end
  end

  def unregister(key) do
    Registry.unregister(__MODULE__, key)
  end

  def unregister!(key) do
    :ok = unregister(key)
  end

  def update(key, updater) do
    Registry.update_value(__MODULE__, key, updater)
  end

  def update!(key, updater) do
    case update(key, updater) do
      {new, old} -> {new, old}
      :error -> Raise.error({__ENV__.function, {key, updater}})
    end
  end

  def lookup(key) do
    Registry.lookup(__MODULE__, key)
  end

  def select(query) do
    Registry.select(__MODULE__, query)
  end

  def dump() do
    matcher = {:"$1", :"$2", :"$3"}
    selector = [{{:"$1", :"$2", :"$3"}}]
    select([{matcher, [], selector}])
  end

  def unregister_all!() do
    Registry.keys(__MODULE__, self())
    |> Enum.each(&unregister!/1)
  end
end
