defmodule Athasha.Items do
  alias Athasha.Store
  alias Athasha.Bus

  @runner [{{{:runner, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
  @status [{{{:status, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
  @password [{{{:password, :"$1", :"$2"}, :"$3", :"$4"}, [], [{{:"$1", :"$2", :"$3", :"$4"}}]}]
  @list [{{{:item, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]

  def all() do
    Store.lookup(:items)
  end

  def list() do
    Store.select(@list)
  end

  def runners() do
    Store.select(@runner)
  end

  def status() do
    Store.select(@status)
  end

  def passwords() do
    Store.select(@password)
  end

  def register_all!(items) do
    Store.register!(:items, {0, items})
  end

  def update_all!(items, version) do
    Store.update!(:items, fn _ -> {version, items} end)
  end

  def register_item!(item) do
    Store.register!({:item, item.id}, item)
    dispatch_item!(item.id, item)
  end

  def unregister_item!(item) do
    id = item.id
    Store.unregister!({:item, id})
    dispatch_item!(id, nil)
  end

  def update_item!(item) do
    id = item.id
    Store.update!({:item, id}, fn _ -> item end)
    dispatch_item!(id, item)
  end

  defp dispatch_item!(id, item) do
    Bus.dispatch!(:item, {:id, item})
    Bus.dispatch!({:item, id}, item)
  end

  def register_runner!(item) do
    Store.register!({:runner, item.id}, item)
  end

  def find_runner(id) do
    case Store.lookup({:runner, id}) do
      [{_, item}] -> item
      [] -> nil
    end
  end

  def register_status!(item, type, msg) do
    update_status!(item, type, msg, true)
  end

  def update_status!(item, type, msg, first \\ false) do
    id = item.id

    case first do
      true ->
        value = {item.name, item.type, type, msg}
        Store.register!({:status, id}, value)

      false ->
        updater = fn {s0, s1, _, _} -> {s0, s1, type, msg} end
        Store.update!({:status, id}, updater)
    end

    Bus.dispatch!(:status, %{id: id, type: type, msg: msg})
    Bus.dispatch!({:status, id}, %{type: type, msg: msg})
  end

  def register_password!(item, password) do
    Store.register!({:password, item.id, item.type}, password)
  end

  def find_password(id, type) do
    case Store.lookup({:password, id, type}) do
      [{_, password}] -> password
      [] -> nil
    end
  end

  def runner_pid(id) do
    q = [{{{:runner, id}, :"$1", :_}, [], [{{:"$1"}}]}]

    case Store.select(q) do
      [{pid}] -> pid
      [] -> nil
    end
  end
end
