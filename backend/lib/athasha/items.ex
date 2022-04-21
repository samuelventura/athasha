defmodule Athasha.Items do
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

  def unregister(key) do
    Registry.unregister(__MODULE__, key)
  end

  def update(key, value) do
    Registry.update_value(__MODULE__, key, fn _ -> value end)
  end

  def lookup(key) do
    Registry.lookup(__MODULE__, key)
  end

  def select(query) do
    Registry.select(__MODULE__, query)
  end

  @runner [{{{:runner, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
  @status [{{{:status, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
  @items [{{{:item, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]

  def all() do
    lookup(:all)
  end

  def items() do
    select(@items)
  end

  def runners() do
    select(@runner)
  end

  def status() do
    select(@status)
  end
end
