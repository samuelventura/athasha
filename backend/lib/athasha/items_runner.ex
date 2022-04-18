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
    {:ok, state}
  end

  def handle_info({:items, nil, {:init, _all}}, state) do
    {:stop, :normal, state}
  end

  def handle_info({:items, nil, {_from, version, muta}}, state) do
    case state.version + 1 do
      ^version ->
        state = Map.put(state, :version, version)

        args = muta.args

        state =
          case muta.name do
            "create" ->
              put_in(state, [:items, args.id], args)

            "rename" ->
              put_in(state, [:items, args.id, :name], args.name)

            "enable" ->
              put_in(state, [:items, args.id, :enabled], args.enabled)

            "edit" ->
              put_in(state, [:items, args.id, :config], args.config)

            "delete" ->
              {_, state} = pop_in(state, [:items, args.id])
              state
          end

        IO.inspect(state)
        {:noreply, state}

      _ ->
        {:noreply, state}
    end
  end
end
