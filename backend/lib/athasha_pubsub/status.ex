defmodule Athasha.PubSub.Status do
  alias Athasha.Store
  alias Athasha.Bus

  @key :status
  @list [{{{@key, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]

  def list() do
    Store.select(@list)
  end

  def register!(item, type, msg) do
    id = item.id
    value = {item.name, item.type, type, msg}
    Store.register!({@key, id}, value)
    dispatch!(id, type, msg)
  end

  def update!(item, type, msg) do
    id = item.id
    updater = fn {s0, s1, _, _} -> {s0, s1, type, msg} end
    Store.update!({@key, id}, updater)
    dispatch!(id, type, msg)
  end

  defp dispatch!(id, type, msg) do
    Bus.dispatch!(@key, %{id: id, type: type, msg: msg})
    Bus.dispatch!({@key, id}, %{type: type, msg: msg})
  end
end
