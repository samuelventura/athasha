defmodule Athasha.Server do
  use GenServer
  # 1hr in millis
  @check 1000 * 60 * 60

  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.Spec
  alias Athasha.Repo
  alias Athasha.Item
  alias Athasha.Items

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    items = Repo.all(Item)
    Items.register_all!(items)
    items |> Enum.each(fn item -> Items.register_item!(item) end)
    items = items |> Enum.into(%{}, &{&1.id, &1})

    state = %{version: 0, items: items}
    all = get_all(state)
    Bus.dispatch!(:items, {:init, all})
    Process.send_after(self(), :check, 0)
    {:ok, state}
  end

  def all() do
    GenServer.call(__MODULE__, :all)
  end

  def apply(muta) do
    GenServer.call(__MODULE__, {:apply, self(), muta})
  end

  def check() do
    Process.send(__MODULE__, :check, [])
  end

  def handle_info(:check, state) do
    total = Auth.licenses()

    Enum.reduce(state.items, 0, fn {_, item}, count ->
      case item.enabled do
        true ->
          if count >= total do
            spawn(fn ->
              args = %{id: item.id, enabled: false}
              muta = %{name: "enable", args: args}
              apply(muta)
            end)
          end

          count + 1

        false ->
          count
      end
    end)

    Process.send_after(self(), :check, @check)
    {:noreply, state}
  end

  def handle_call(:all, _from, state) do
    all = get_all(state)
    {:reply, all, state}
  end

  def handle_call({:apply, from, muta = %{name: "restore"}}, _from, state) do
    state =
      Enum.reduce(muta.args, state, fn item, state ->
        muta = %{name: "restore", args: item}

        case apply_safe(muta, from, state) do
          {:ok, state} -> state
          {:error, _error, state} -> state
        end
      end)

    {:reply, :ok, state}
  end

  def handle_call({:apply, from, muta}, _from, state) do
    case apply_safe(muta, from, state) do
      {:ok, state} -> {:reply, :ok, state}
      {:error, error, state} -> {:reply, {:error, error}, state}
    end
  end

  # rescue from multi user race conditions for instance
  # restore below will throw if items not empty
  # in any other case the changeset and database
  # should throw on out of sync conditions
  # the key is to dispatch only after success

  def apply_safe(muta, from, state) do
    try do
      state = apply_muta(muta, from, state)
      {:ok, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__, from, muta, state})
        {:error, e, state}
    end
  end

  defp apply_muta(muta = %{name: "restore"}, from, state) do
    args = muta.args
    {:ok, item} = insert(args, :id)
    args = strip_item(item)
    muta = Map.put(muta, :args, args)
    muta = Map.put(muta, :name, "create")
    apply_muta(:set, item, muta, from, state)
  end

  defp apply_muta(muta = %{name: "create"}, from, state) do
    args = muta.args
    {:ok, item} = insert(args)
    args = strip_item(item)
    muta = Map.put(muta, :args, args)
    apply_muta(:set, item, muta, from, state)
  end

  defp apply_muta(muta = %{name: "delete"}, from, state) do
    args = muta.args
    item = state.items[args.id]
    {:ok, _} = Repo.delete(%Item{id: item.id})
    apply_muta(:del, item, muta, from, state)
  end

  defp apply_muta(muta = %{name: "rename"}, from, state) do
    apply_muta(:update, muta, from, state)
  end

  defp apply_muta(muta = %{name: "enable"}, from, state) do
    apply_muta(:update, muta, from, state)
  end

  defp apply_muta(muta = %{name: "edit"}, from, state) do
    apply_muta(:update, muta, from, state)
  end

  defp apply_muta(:update, muta, from, state) do
    args = muta.args
    item = state.items[args.id]
    {:ok, item} = update(item, args)
    apply_muta(:put, item, muta, from, state)
  end

  defp apply_muta(action, item, muta, from, state) do
    items = state.items
    id = item.id

    items =
      case action do
        :set ->
          Items.register_item!(item)
          Map.put(items, id, item)

        :put ->
          Items.update_item!(item)
          Map.put(items, id, item)

        :del ->
          Items.unregister_item!(item)
          Map.delete(items, id)
      end

    version = state.version + 1
    Items.update_all!(items, version)
    Bus.dispatch!(:items, {from, version, muta})
    Bus.dispatch!({:items, id}, {from, version, muta})
    state = Map.put(state, :items, items)
    Map.put(state, :version, version)
  end

  defp get_all(state) do
    items = state.items |> Enum.map(&strip_tuple/1)
    %{version: state.version, items: items}
  end

  defp update(item, args) do
    Item.changeset(item, args) |> Repo.update()
  end

  defp insert(args) do
    Item.changeset(%Item{}, args) |> Repo.insert()
  end

  defp insert(args, :id) do
    Item.changeset(%Item{}, args, :id) |> Repo.insert()
  end

  defp strip_tuple({_id, item}) do
    strip_item(item)
  end

  defp strip_item(item) do
    Map.take(item, [:id, :name, :type, :enabled, :config])
  end
end
