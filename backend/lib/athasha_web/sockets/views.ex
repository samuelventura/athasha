defmodule AthashaWeb.Socket.Views do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Item
  alias Athasha.Server
  alias Athasha.Globals

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(_state) do
    {:ok, %{logged: false}}
  end

  def init(state) do
    Process.send_after(self(), :ping, @ping)
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end

  def handle_info(:ping, state) do
    resp = %{name: "ping"}
    reply_text(resp, state)
  end

  def handle_info({:status, nil, status}, state) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:logged, state) do
    Bus.register!(:status, nil)
    Bus.register!(:items, nil)
    all = Server.all()
    state = Map.put(state, :version, all.version)
    args = %{addresses: Globals.find_addresses()}
    items = Enum.map(all.items, &Item.head(&1))
    args = Map.put(args, :items, items)
    resp = %{name: "all", args: args}
    reply_text(resp, state)
  end

  def handle_info({:items, nil, {:init, _items}}, state) do
    {:stop, :init, state}
  end

  def handle_info({:items, nil, {_from, version, muta, item}}, state) do
    # do not handle "edit" in separated method without updateing state version
    case state.version + 1 do
      ^version ->
        case muta.name do
          "edit" ->
            state = Map.put(state, :version, version)
            {:ok, state}

          _ ->
            item = Item.head(item)
            args = %{version: version, id: item.id, item: item}
            muta = Map.put(muta, :args, args)
            state = Map.put(state, :version, version)
            reply_text(muta, state)
        end

      _ ->
        {:ok, state}
    end
  end

  def handle_in({text, _opts}, state) do
    event = Jason.decode!(text)
    handle_event(event, state)
  end

  defp handle_event(%{"name" => "pong"}, state) do
    Process.send_after(self(), :ping, @ping)
    {:ok, state}
  end

  defp handle_event(event = %{"name" => "login"}, state = %{logged: false}) do
    args = event["args"]
    session = args["session"]
    Process.send_after(self(), :logged, 0)
    state = Map.put(state, :logged, true)
    resp = %{name: "session", args: session}
    reply_text(resp, state)
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
