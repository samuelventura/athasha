defmodule Athasha.PubSub.Input do
  alias Athasha.Store
  alias Athasha.Bus

  @key :input

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(id) do
    key = {@key, id}
    Store.register!(key, nil)
    dispatch!(id, nil)
  end

  def update!(id, value) do
    key = {@key, id}
    Store.update!(key, fn _ -> value end)
    dispatch!(id, value)
  end

  defp dispatch!(id, value) do
    Bus.dispatch!({@key, id}, value)
  end

  def get_value(id) do
    match = {{@key, id}, :_, :"$1"}
    select = {{:"$1"}}
    query = [{match, [], [select]}]

    # select throws on argument error
    case Store.select(query) do
      [{value}] -> value
      [] -> nil
    end
  end
end
