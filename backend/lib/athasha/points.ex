defmodule Athasha.Points do
  alias Athasha.Store
  alias Athasha.Bus

  @key :point

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register_point!(id) do
    key = {@key, id}
    Store.register!(key, nil)
    dispatch_point!(id, nil)
  end

  def update_point!(id, value) do
    key = {@key, id}
    Store.update!(key, fn _ -> value end)
    dispatch_point!(id, value)
  end

  defp dispatch_point!(id, value) do
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

  def screen_points(id) do
    match = {{:screen, id, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end
end
