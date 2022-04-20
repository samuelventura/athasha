defmodule Athasha.Points do
  alias Athasha.Spec

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    Registry.start_link(keys: :unique, name: __MODULE__)
  end

  def register(key, args \\ nil) do
    Registry.register(__MODULE__, key, args)
  end

  def update(key, value) do
    Registry.update_value(__MODULE__, key, fn _ -> value end)
  end

  def all() do
    all = [{{:"$1", :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
    Registry.select(__MODULE__, all)
  end

  def one(id) do
    one = [{{{id, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
    Registry.select(__MODULE__, one)
  end
end
