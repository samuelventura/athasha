defmodule Athasha.ItemsServer do
  use GenServer

  alias Athasha.Spec
  alias Athasha.Repo
  alias Athasha.Item
  alias Athasha.Registry

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    items =
      Repo.all(Item)
      |> Enum.into(%{}, &start/1)

    {:ok, %{version: 0, items: items}}
  end

  def all() do
    GenServer.call(__MODULE__, :all)
  end

  def apply(muta) do
    GenServer.call(__MODULE__, {:apply, self(), muta})
  end

  def handle_call(:all, _from, state = %{version: version}) do
    items =
      state.items
      |> Enum.map(&strip_tuple/1)

    all = %{version: version, items: items}
    {:reply, all, state}
  end

  def handle_call({:apply, from, muta}, _from, state) do
    state = apply_muta(muta, from, state)
    {:reply, :ok, state}
  end

  defp apply_muta(muta = %{"name" => "create"}, from, state) do
    args = muta["args"]
    {:ok, item} = insert(args)
    args = %{item: strip_item(item)}
    muta = Map.put(muta, "args", args)
    version = state.version + 1
    Registry.dispatch(:items, {from, version, muta})
    state = put_item(state, item)
    Map.put(state, :version, version)
  end

  defp start(item) do
    # IO.inspect(item)
    {item.id, item}
  end

  defp insert(args) do
    Item.changeset(%Item{}, args) |> Repo.insert()
  end

  defp put_item(state, item) do
    put_in(state.items[item.id], item)
  end

  defp strip_tuple({_id, item}) do
    strip_item(item)
  end

  defp strip_item(item) do
    Map.take(item, [:id, :config, :enabled, :name, :type, :version])
  end
end
