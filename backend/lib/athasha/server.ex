defmodule Athasha.Server do
  use GenServer
  # 1hr in millis
  @check 1000 * 60 * 60

  alias Athasha.Auth
  alias Athasha.Spec
  alias Athasha.Repo
  alias Athasha.Item
  alias Athasha.PubSub
  alias Athasha.Environ

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    items = Repo.all(Item)
    items |> Enum.each(fn item -> PubSub.Item.register!(item) end)
    items = items |> Enum.into(%{}, &{&1.id, &1})
    state = %{version: 0, items: items}
    PubSub.Version.register!()
    check = Process.send_after(self(), :check, 0)
    state = Map.put(state, :check, check)
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
    total = Environ.load_identity() |> Auth.count_licenses()

    Enum.map(state.items, &elem(&1, 1))
    |> Enum.shuffle()
    |> Enum.reduce(0, fn item, count ->
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

    Process.cancel_timer(state.check)
    check = Process.send_after(self(), :check, @check)
    state = Map.put(state, :check, check)
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
    args = Item.strip(item)
    muta = Map.put(muta, :args, args)
    muta = Map.put(muta, :name, "create")
    muta = Map.put(muta, :restore, true)
    apply_muta(:set, item, muta, from, state)
  end

  defp apply_muta(muta = %{name: "create"}, from, state) do
    args = muta.args
    {:ok, item} = insert(args)
    args = Item.strip(item)
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
          PubSub.Item.register!(item)
          Map.put(items, id, item)

        :put ->
          PubSub.Item.update!(item)
          Map.put(items, id, item)

        :del ->
          PubSub.Item.unregister!(item)
          Map.delete(items, id)
      end

    version = state.version + 1
    state = Map.put(state, :items, items)
    item = Item.strip(item)
    PubSub.Version.update!(version, item, from, muta)
    Map.put(state, :version, version)
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

  defp get_all(state) do
    items = strip_map(state.items)
    %{version: state.version, items: items}
  end

  defp strip_tuple({_id, item}) do
    Item.strip(item)
  end

  defp strip_map(items) do
    items |> Enum.map(&strip_tuple/1)
  end
end
