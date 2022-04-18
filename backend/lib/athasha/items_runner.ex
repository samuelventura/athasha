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
    state = %{version: all.version}
    {:ok, state}
  end

  def handle_info({:items, nil, {:init, _all}}, state) do
    {:stop, :init, state}
  end

  def handle_info({:items, nil, {_from, version, _muta}}, state) do
    case state.version + 1 do
      ^version ->
        state = Map.put(state, :version, version)
        {:ok, state}

      _ ->
        {:ok, state}
    end
  end
end
