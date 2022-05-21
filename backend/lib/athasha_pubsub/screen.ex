defmodule Athasha.PubSub.Screen do
  alias Athasha.Store
  alias Athasha.Bus

  @key :screen

  def list(id) do
    match = {{@key, id, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(id, point) do
    Store.register!({@key, id, point})
    Bus.dispatch!({@key, id}, {point, nil})
  end

  def update!(id, point, value) do
    Store.update!({@key, id, point}, fn _ -> value end)
    Bus.dispatch!({@key, id}, {point, value})
  end
end
