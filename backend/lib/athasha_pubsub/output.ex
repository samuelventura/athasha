defmodule Athasha.PubSub.Output do
  alias Athasha.Store
  alias Athasha.Bus

  @key :output
  @keys :outputs

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def reg_names!(id, names) do
    Store.register!({@keys, id}, names)
  end

  def get_names(id) do
    case Store.lookup({@keys, id}) do
      [{_, names}] -> names
      [] -> nil
    end
  end

  def register!(id, oid, name) do
    Store.register!({@key, oid})
    Store.register!({@key, id, name})
    dispatch!(id, oid, name, nil)
  end

  def update!(id, oid, name, value) do
    Store.update!({@key, oid}, fn _ -> value end)
    {new, old} = Store.update!({@key, id, name}, fn _ -> value end)

    if new != old do
      dispatch!(id, oid, name, value)
    end
  end

  defp dispatch!(id, iid, name, value) do
    Bus.dispatch!({@key, iid}, value)
    Bus.dispatch!({@key, id, name}, value)
    Bus.dispatch!({@key, id}, {name, value})
  end

  def get_value(iid) do
    match = {{@key, iid}, :_, :"$1"}
    select = {{:"$1"}}
    query = [{match, [], [select]}]

    case Store.select(query) do
      [{value}] -> value
      [] -> nil
    end
  end

  def get_values(id) do
    match = {{@key, id, :"$1"}, :_, :"$2"}
    select = {{:"$1", :"$2"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end
end
