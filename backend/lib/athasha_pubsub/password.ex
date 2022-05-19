defmodule Athasha.PubSub.Password do
  alias Athasha.Store

  @key :password
  @list [{{{@key, :"$1", :"$2"}, :"$3", :"$4"}, [], [{{:"$1", :"$2", :"$3", :"$4"}}]}]

  def list() do
    Store.select(@list)
  end

  def register!(item, password) do
    Store.register!({@key, item.id, item.type}, password)
  end

  def find(id, type) do
    case Store.lookup({@key, id, type}) do
      [{_, password}] -> password
      [] -> nil
    end
  end
end
