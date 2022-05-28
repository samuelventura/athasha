defmodule Athasha.Runner do
  use GenServer

  alias Athasha.Bus
  alias Athasha.Spec
  alias Athasha.Raise
  alias Athasha.Store
  alias Athasha.Server
  alias Athasha.PubSub
  alias Athasha.Runners

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    Bus.register!(:version)
    {:ok, _} = Runners.start_link()
    all = Server.all()
    items = all.items |> Enum.into(%{}, &{&1.id, &1})
    state = %{version: all.version, items: items}
    all.items |> Enum.each(&start_if/1)
    check_count(state)
    {:ok, state}
  end

  def handle_info({:version, nil, :init}, state) do
    {:stop, :init, state}
  end

  def handle_info({:version, nil, {_from, version, muta, item}}, state) do
    state =
      case state.version + 1 do
        ^version -> apply_muta(version, muta, item, state)
        _ -> state
      end

    check_count(state)
    {:noreply, state}
  end

  def apply_muta(version, muta, item, state) do
    state = Map.put(state, :version, version)

    case muta.name do
      "create" ->
        id = item.id
        start_if(item)
        put_in(state, [:items, id], item)

      "delete" ->
        id = item.id
        item = state.items[id]
        stop_if(id, item.enabled)
        {_, state} = pop_in(state, [:items, id])
        state

      "enable" ->
        id = item.id
        curr = state.items[id]
        stop_if(id, curr.enabled)
        start_if(item)
        put_in(state, [:items, id], item)

      _ ->
        id = item.id
        put_in(state, [:items, id], item)
    end
  end

  # initial/rescue delay to avoid exceeding
  # the default supervisor restart intensity
  def start_runner(modu, item) do
    pid =
      spawn_link(fn ->
        try do
          # ensure status if linked process dies
          Process.flag(:trap_exit, true)
          PubSub.Runner.register!(item)
          PubSub.Status.register!(item, :warn, "Starting...")
          :timer.sleep(1000)
          modu.run(item)
          Raise.error({:normal_exit, item.id})
        rescue
          e in RuntimeError ->
            error = e.message
            Bus.dispatch!({:error, item.id}, error)
            PubSub.Status.update!(item, :error, error)
            Store.unregister_all!()
            :timer.sleep(2000)
            # nifs not closed on normal exit
            reraise e, __STACKTRACE__

          # mostly for debugging: FunctionClauseError, ...
          e ->
            error = "#{inspect(e)}"
            Bus.dispatch!({:error, item.id}, error)
            PubSub.Status.update!(item, :error, error)
            Store.unregister_all!()
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
        "Screen" -> Athasha.Runner.Screen
        "Modbus" -> Athasha.Runner.Modbus
        "Datalog" -> Athasha.Runner.Datalog
        "Datalink" -> Athasha.Runner.Datalink
        "Datafetch" -> Athasha.Runner.Datafetch
        "Dataplot" -> Athasha.Runner.Dataplot
        "Laurel" -> Athasha.Runner.Laurel
        "Opto22" -> Athasha.Runner.Opto22
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
    case PubSub.Runner.get_pid(id) do
      nil ->
        :ok

      _ ->
        :timer.sleep(1)
        join_runner(id)
    end
  end

  defp check_count(state) do
    c1 = Runners.count()
    c2 = Enum.count(state.items, fn {_id, item} -> item.enabled end)
    assert_count(c1, c2)
  end

  defp assert_count(count, count), do: nil
  defp assert_count(c1, c2), do: Raise.error({:count, c1, c2})
end
