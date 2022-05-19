defmodule Athasha.PubSub.Runner do
  alias Athasha.Store

  @key :runner
  @list [{{{@key, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]

  def list() do
    Store.select(@list)
  end

  def register!(item) do
    Store.register!({@key, item.id}, item)
  end

  def find(id) do
    case Store.lookup({@key, id}) do
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
