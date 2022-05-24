defmodule Athasha.PubSub.Item do
  alias Athasha.Store
  alias Athasha.Item
  alias Athasha.Bus

  @key :item

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(item) do
    item = Item.head(item)
    Store.register!({@key, item.id}, item)
    dispatch!(item.id, item)
  end

  def unregister!(item) do
    id = item.id
    Store.unregister!({@key, id})
    dispatch!(id, nil)
  end

  def update!(item) do
    item = Item.head(item)
    id = item.id
    Store.update!({@key, id}, fn _ -> item end)
    dispatch!(id, item)
  end

  defp dispatch!(id, item) do
    Bus.dispatch!(@key, {:id, item})
    Bus.dispatch!({@key, id}, item)
  end
end
