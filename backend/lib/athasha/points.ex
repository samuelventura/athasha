defmodule Athasha.Points do
  alias Athasha.Store

  def all() do
    match = {{:point, :"$1", :_, :_, :read}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register_read!(item, point) do
    now = System.monotonic_time(:millisecond)
    key = {:point, point.id, item.id, point.name, :read}

    case Store.register(key, {now, nil}) do
      {:ok, _} ->
        :ok

      {:error, reason} ->
        raise {"Point read registration error", {item, point}, reason}
    end
  end

  def update_read!(item, point, value) do
    now = System.monotonic_time(:millisecond)
    key = {:point, point.id, item.id, point.name, :read}

    case Store.update(key, fn _ -> {now, value} end) do
      {_, _} ->
        :ok

      :error ->
        raise {"Point read update error", {item, point, value}}
    end
  end

  def get_read_value(id) do
    match = {{:point, id, :_, :_, :read}, :_, {:_, :"$1"}}
    select = {{:"$1"}}
    query = [{match, [], [select]}]

    # select throws on argument error
    case Store.select(query) do
      [{value}] -> value
      [] -> nil
    end
  end
end
