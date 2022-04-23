defmodule Athasha.Items do
  alias Athasha.Raise
  alias Athasha.Store
  alias Athasha.Bus

  @runner [{{{:runner, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
  @status [{{{:status, :"$1"}, :"$2", :"$3"}, [], [{{:"$1", :"$2", :"$3"}}]}]
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

  def register_runner!(item) do
    case Store.register({:runner, item.id}, item) do
      {:ok, _} ->
        :ok

      {:error, reason} ->
        Raise.error({"Item register runner error", item, reason})
    end
  end

  def register_all!(items) do
    case Store.register(:items, {0, items}) do
      {:ok, _} ->
        :ok

      {:error, reason} ->
        Raise.error({"Item register all error", items, reason})
    end
  end

  def update_all!(items, version) do
    case Store.update(:items, fn _ -> {version, items} end) do
      {_, _} ->
        :ok

      :error ->
        Raise.error({"Item update all error", items})
    end
  end

  def register_item!(item) do
    case Store.register({:item, item.id}, item) do
      {:ok, _} ->
        :ok

      {:error, reason} ->
        Raise.error({"Item register error", item, reason})
    end
  end

  def unregister_item!(item) do
    case Store.unregister({:item, item.id}) do
      :ok ->
        :ok

      {:error, reason} ->
        Raise.error({"Item unregister error", item, reason})
    end
  end

  def update_item!(item) do
    case Store.update({:item, item.id}, fn _ -> item end) do
      {_, _} ->
        :ok

      :error ->
        Raise.error({"Item update error", item})
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

        case Store.register({:status, id}, value) do
          {:ok, _} ->
            :ok

          {:error, reason} ->
            Raise.error({"Item register status error", {item, type, msg, first}, reason})
        end

      false ->
        updater = fn {s0, s1, _, _} -> {s0, s1, type, msg} end

        case Store.update({:status, id}, updater) do
          {_, _} ->
            :ok

          :error ->
            Raise.error({"Item update status error", {item, type, msg, first}})
        end
    end

    status = %{id: id, type: type, msg: msg}

    case Bus.dispatch(:status, status) do
      :ok ->
        :ok

      {:error, reason} ->
        Raise.error({"Item dispatch status error", {item, type, msg, first}, reason})
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
