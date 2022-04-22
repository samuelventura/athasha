defmodule Athasha.Runner do
  use GenServer

  alias Athasha.Bus
  alias Athasha.Spec
  alias Athasha.Items
  alias Athasha.Server
  alias Athasha.Runners

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    {:ok, _} = Runners.start_link()
    {:ok, _} = Bus.register(:items, nil)
    all = Server.all()
    items = all.items |> Enum.into(%{}, &{&1.id, &1})
    state = %{version: all.version, items: items}
    all.items |> Enum.each(&start_if/1)
    {:ok, state}
  end

  def handle_info({:items, nil, {:init, _all}}, state) do
    {:stop, :init, state}
  end

  def handle_info({:items, nil, {_from, version, muta}}, state) do
    state =
      case state.version + 1 do
        ^version -> apply_muta(version, muta, state)
        _ -> state
      end

    {:noreply, state}
  end

  def apply_muta(version, muta, state) do
    state = Map.put(state, :version, version)
    args = muta.args

    case muta.name do
      "create" ->
        start_if(args)
        put_in(state, [:items, args.id], args)

      "rename" ->
        put_in(state, [:items, args.id, :name], args.name)

      "enable" ->
        id = args.id
        item = state.items[id]
        stop_if(id, item.enabled)
        item = Map.put(item, :enabled, args.enabled)
        start_if(item)
        put_in(state, [:items, id], item)

      "edit" ->
        put_in(state, [:items, args.id, :config], args.config)

      "delete" ->
        id = args.id
        item = state.items[id]
        stop_if(id, item.enabled)
        {_, state} = pop_in(state, [:items, id])
        state
    end
  end

  defp start_if(item = %{enabled: true}), do: start(item)
  defp start_if(%{enabled: false}), do: nil
  defp stop_if(id, true), do: stop(id)
  defp stop_if(_id, false), do: nil

  defp start(item) do
    modu =
      case item.type do
        "Modbus Reader" -> Athasha.Modbus.Runner
        "Database Writer" -> Athasha.Database.Runner
      end

    id = item.id
    :ok = join_runner(id)
    name = Items.item_name(item)
    spec = Spec.forRunner(modu, id, [item, name])
    {:ok, _} = Runners.add(spec)
  end

  defp stop(id) do
    :ok = Runners.remove(id)
    :ok = join_runner(id)
  end

  defp join_runner(id) do
    case Items.runner_pid(id) do
      nil ->
        :ok

      _ ->
        :timer.sleep(1)
        join_runner(id)
    end
  end
end
