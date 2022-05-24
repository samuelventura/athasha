defmodule Athasha.PubSub.Password do
  alias Athasha.Store
  alias Athasha.Crypto

  @key :password

  def list() do
    match = {{@key, :"$1"}, :"$2", {:"$3", :_}}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(item, password) do
    Store.register!({@key, item.id, item.type}, password)
    Store.register!({@key, item.id}, {password, Crypto.sha1("#{item.id}:#{password}")})
  end

  def get_typed(id, type) do
    case Store.lookup({@key, id, type}) do
      [{_, password}] -> password
      [] -> nil
    end
  end

  def get_pair(id) do
    case Store.lookup({@key, id}) do
      [{_, {password, hash}}] -> {password, hash}
      [] -> {nil, nil}
    end
  end
end
