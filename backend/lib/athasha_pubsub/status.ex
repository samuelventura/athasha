defmodule Athasha.PubSub.Status do
  alias Athasha.Store
  alias Athasha.Bus

  @key :status

  def list() do
    match = {{@key, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def get_one(id) do
    case Store.lookup({@key, id}) do
      [{_, status}] -> to_map(id, status)
      [] -> to_map(id, {nil, nil})
    end
  end

  def get_all() do
    match = {{@key, :"$1"}, :_, :"$2"}
    select = {{:"$1", :"$2"}}
    query = [{match, [], [select]}]
    Store.select(query) |> to_map
  end

  def register!(item, type, msg) do
    id = item.id
    Store.register!({@key, id}, {type, msg})
    dispatch!(id, type, msg)
  end

  def update!(item, type, msg) do
    id = item.id
    updater = fn {_, _} -> {type, msg} end
    {{newt, newm}, {oldt, oldm}} = Store.update!({@key, id}, updater)

    if newt != oldt || newm != oldm do
      dispatch!(id, type, msg)
    end
  end

  defp dispatch!(id, type, msg) do
    Bus.dispatch!(@key, %{id: id, type: type, msg: msg})
    Bus.dispatch!({@key, id}, %{type: type, msg: msg})
  end

  defp to_map([]), do: []
  defp to_map([{id, status} | tail]), do: [to_map(id, status) | to_map(tail)]
  defp to_map(id, {type, msg}), do: %{id: id, type: type, msg: msg}
end
