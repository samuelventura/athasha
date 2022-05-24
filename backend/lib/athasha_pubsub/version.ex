defmodule Athasha.PubSub.Version do
  alias Athasha.Store
  alias Athasha.Bus

  @key :version

  def list() do
    Store.lookup(@key)
  end

  def register!() do
    Store.register!(@key, 0)
    Bus.dispatch!(@key, :init)
  end

  def update!(version, item, from, muta) do
    Store.update!(@key, fn _ -> version end)
    Bus.dispatch!(@key, {from, version, muta, item})
    Bus.dispatch!({@key, item.id}, {from, version, muta, item})
  end
end
