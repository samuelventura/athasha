defmodule Athasha.PubSub.Runner do
  alias Athasha.Store
  alias Athasha.Item

  @key :runner
  @keyc :config

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(item) do
    Store.register!({@key, item.id}, Item.head(item))
    Store.register!({@keyc, item.id}, Item.strip(item))
  end

  def find(id) do
    case Store.lookup({@keyc, id}) do
      [{_, item}] -> item
      [] -> nil
    end
  end

  def pid(id) do
    q = [{{{@key, id}, :"$1", :_}, [], [{{:"$1"}}]}]

    case Store.select(q) do
      [{pid}] -> pid
      [] -> nil
    end
  end
end
