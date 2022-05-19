defmodule Athasha.Store.Items do
  alias Athasha.Store
  alias Athasha.Bus

  @key :items

  def list() do
    Store.lookup(@key)
  end

  def register!(items) do
    Store.register!(@key, {0, items})
    Bus.dispatch!(@key, {:init, items})
  end

  def update!(items, version, item, from, muta) do
    Store.update!(@key, fn _ -> {version, items} end)
    Bus.dispatch!(@key, {from, version, muta, item})
    Bus.dispatch!({@key, item.id}, {from, version, muta, item})
  end
end
