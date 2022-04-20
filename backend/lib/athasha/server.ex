defmodule Athasha.Server do
  use GenServer

  alias Athasha.Bus
  alias Athasha.Spec
  alias Athasha.Repo
  alias Athasha.Item
  alias Athasha.Items

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    items = Repo.all(Item)
    Items.register(:items, {0, items})
    items = items |> Enum.into(%{}, &{&1.id, &1})

    state = %{version: 0, items: items}
    all = get_all(state)
    Bus.dispatch(:items, {:init, all})
    {:ok, state}
  end

  def all() do
    GenServer.call(__MODULE__, :all)
  end

  def apply(muta) do
    GenServer.call(__MODULE__, {:apply, self(), muta})
  end

  def handle_call(:all, _from, state) do
    all = get_all(state)
    {:reply, all, state}
  end

  def handle_call({:apply, from, muta}, _from, state) do
    try do
      state = apply_muta(muta, from, state)
      {:reply, :ok, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__})
        {:reply, {:error, e}, state}
    end
  end

  defp apply_muta(muta = %{name: "restore"}, from, state = %{items: %{}}) do
    Enum.reduce(muta.args, state, fn item, state ->
      {:ok, item} = insert(item, :id)
      args = strip_item(item)
      muta = %{name: "create", args: args}
      apply_muta(:put, item, muta, from, state)
    end)
  end

  defp apply_muta(muta = %{name: "create"}, from, state) do
    args = muta.args
    {:ok, item} = insert(args)
    args = strip_item(item)
    muta = Map.put(muta, :args, args)
    apply_muta(:put, item, muta, from, state)
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

    items =
      case action do
        :put -> Map.put(items, item.id, item)
        :del -> Map.delete(items, item.id)
      end

    version = state.version + 1
    Items.update(:items, {version, items})
    Bus.dispatch(:items, {from, version, muta})
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
