defmodule Athasha.Runner do
  use GenServer

  alias Athasha.Bus
  alias Athasha.Spec
  alias Athasha.Raise
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
    Bus.register!(:items, nil)
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

  # initial/rescue 1s delay to avoid exceeding
  # the default supervisor restart intensity
  def start_runner(modu, item) do
    pid =
      spawn_link(fn ->
        try do
          # ensure status if linked process dies
          Process.flag(:trap_exit, true)
          Items.register_runner!(item)
          Items.register_status!(item, :warn, "Starting...")
          :timer.sleep(1000)
          modu.run(item)
          Raise.error({:normal_exit, item.id})
        rescue
          e in RuntimeError ->
            Items.update_status!(item, :error, e.message)
            :timer.sleep(2000)
            # nifs not closed on normal exit
            reraise e, __STACKTRACE__

          # mostly for debugging: FunctionClauseError, ...
          e ->
            Items.update_status!(item, :error, "#{inspect(e)}")
            :timer.sleep(2000)
            # nifs not closed on normal exit
            reraise e, __STACKTRACE__
        end
      end)

    {:ok, pid}
  end

  defp start_if(item = %{enabled: true}), do: start(item)
  defp start_if(%{enabled: false}), do: nil
  defp stop_if(id, true), do: stop(id)
  defp stop_if(_id, false), do: nil

  defp start(item) do
    modu =
      case item.type do
        "Screen" -> Athasha.ScreenRunner
        "Modbus" -> Athasha.ModbusRunner
        "Database" -> Athasha.DatabaseRunner
        "Dataplot" -> Athasha.DataplotRunner
        "Laurel" -> Athasha.LaurelRunner
        "Opto22" -> Athasha.Opto22Runner
      end

    id = item.id
    :ok = join_runner(id)
    spec = spec(modu, item)
    {:ok, _} = Runners.add(spec)
  end

  defp stop(id) do
    :ok = Runners.remove(id)
    :ok = join_runner(id)
  end

  defp spec(modu, item) do
    %{
      id: item.id,
      start: {__MODULE__, :start_runner, [modu, item]},
      type: :worker,
      restart: :permanent,
      shutdown: :brutal_kill
    }
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
