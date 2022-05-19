defmodule Athasha.PubSub.Item do
  alias Athasha.Store
  alias Athasha.Bus

  @key :item
  @list [{{{@key, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]

  def list() do
    Store.select(@list)
  end

  def register!(item) do
    Store.register!({@key, item.id}, item)
    dispatch!(item.id, item)
  end

  def unregister!(item) do
    id = item.id
    Store.unregister!({@key, id})
    dispatch!(id, nil)
  end

  def update!(item) do
    id = item.id
    Store.update!({@key, id}, fn _ -> item end)
    dispatch!(id, item)
  end

  defp dispatch!(id, item) do
    Bus.dispatch!(@key, {:id, item})
    Bus.dispatch!({@key, id}, item)
  end
end
