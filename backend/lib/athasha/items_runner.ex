defmodule Athasha.ItemsRunner do
  use GenServer

  alias Athasha.Bus
  alias Athasha.Spec
  alias Athasha.ItemsServer

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    {:ok, _} = Bus.register(:items, nil)
    all = ItemsServer.all()
    items = all.items |> Enum.into(%{}, &{&1.id, &1})
    state = %{version: all.version, items: items}
    state = all.items |> Enum.reduce(state, &init_if/2)
    {:ok, state}
  end

  def handle_info({:items, nil, {:init, _all}}, state) do
    {:stop, :init, state}
  end

  def handle_info({:items, nil, {_from, version, muta}}, state) do
    try do
      state = apply_muta(version, muta, state)
      {:noreply, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__})
        {:noreply, state}
    end
  end

  def apply_muta(version, muta, state) do
    case state.version + 1 do
      ^version ->
        state = Map.put(state, :version, version)
        args = muta.args

        case muta.name do
          "create" ->
            state = start_if(state, args)
            put_in(state, [:items, args.id], args)

          "rename" ->
            put_in(state, [:items, args.id, :name], args.name)

          "enable" ->
            id = args.id
            item = state.items[id]
            state = stop_if(state, id, item.enabled)
            item = Map.put(item, :enabled, args.enabled)
            state = start_if(state, item)
            put_in(state, [:items, id], item)

          "edit" ->
            put_in(state, [:items, args.id, :config], args.config)

          "delete" ->
            id = args.id
            item = state.items[id]
            state = stop_if(state, id, item.enabled)
            {_, state} = pop_in(state, [:items, id])
            state
        end

      _ ->
        state
    end
  end

  defp init_if(item, state), do: start_if(state, item)
  defp start_if(state, item = %{enabled: true}), do: start(state, item)
  defp start_if(state, %{enabled: false}), do: state
  defp stop_if(state, id, true), do: stop(state, id)
  defp stop_if(state, _id, false), do: state

  defp start(state, item) do
    modu =
      case item.type do
        "Modbus Device" -> Athasha.RunnerModbus
      end

    # assert
    false = Map.has_key?(state, item.id)
    {:ok, pid} = modu.start_link(item)
    Map.put(state, item.id, {modu, pid})
  end

  defp stop(state, id) do
    {modu, pid} = state[id]
    :ok = modu.stop(pid)
    Map.delete(state, id)
  end
end
