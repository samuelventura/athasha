defmodule AthashaWeb.Socket.Screen do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  @item "Screen"
  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.PubSub

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    {:ok, %{logged: false, id: state.params["id"]}}
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

  def handle_info({{:error, _id}, nil, _error}, state) do
    {:stop, :error, state}
  end

  # disconnect on any item enable|delete event
  def handle_info({{:items, _id}, nil, {_from, _version, muta, _item}}, state) do
    case muta.name do
      "enable" -> {:stop, :update, state}
      "delete" -> {:stop, :update, state}
      _ -> {:ok, state}
    end
  end

  def handle_info({{:screen, id}, nil, {point, value}}, state = %{id: id}) do
    args = %{id: point, value: value}
    resp = %{name: "point", args: args}
    reply_text(resp, state)
  end

  def handle_info({{:status, id}, nil, status}, state = %{id: id}) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id}) do
    item = PubSub.Runner.find(id)
    Bus.register!({:error, id}, nil)
    Bus.register!({:status, id}, nil)
    Bus.register!({:screen, id}, nil)
    Bus.register!({:items, id}, nil)
    config = item.config
    initial = PubSub.Screen.list(id) |> Enum.map(&initial_point/1)
    args = %{id: id, type: item.type, name: item.name, initial: initial, config: config}
    resp = %{name: "view", args: args}
    reply_text(resp, state)
  end

  def handle_in({text, _opts}, state) do
    event = Jason.decode!(text)
    handle_event(event, state)
  end

  defp handle_event(%{"name" => "pong"}, state) do
    Process.send_after(self(), :ping, @ping)
    {:ok, state}
  end

  defp handle_event(event = %{"name" => "login"}, state = %{id: id, logged: false}) do
    args = event["args"]
    session = args["session"]
    password = PubSub.Password.find(id, @item)

    case Auth.login(session["token"], session["proof"], password) do
      true ->
        Process.send_after(self(), :logged, 0)
        state = Map.put(state, :logged, true)
        resp = %{name: "session", args: session}
        reply_text(resp, state)

      false ->
        resp = %{name: "login", args: args["active"]}
        reply_text(resp, state)
    end
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end

  defp initial_point({id, _, value}) do
    %{id: id, value: value}
  end
end
