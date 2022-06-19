defmodule Athasha.PubSub.Output do
  alias Athasha.Store
  alias Athasha.Bus

  @key :output
  @names :onames
  @types :otypes

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def reg_names!(id, names) do
    Store.register!({@names, id}, names)
  end

  def get_names(id) do
    case Store.lookup({@names, id}) do
      [{_, names}] -> names
      [] -> nil
    end
  end

  def reg_types!(id, types) do
    Store.register!({@types, id}, types)
  end

  def get_types(id) do
    case Store.lookup({@types, id}) do
      [{_, types}] -> types
      [] -> nil
    end
  end

  def register!(id, oid, name, value \\ nil) do
    Store.register!({@key, oid}, value)
    Store.register!({@key, id, name}, value)
    dispatch!(id, oid, name, value)
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
