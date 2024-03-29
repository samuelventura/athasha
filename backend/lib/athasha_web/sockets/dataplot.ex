defmodule AthashaWeb.Socket.Dataplot do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  @item "Dataplot"
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
  def handle_info({{:version, _id}, nil, {_from, _version, muta, _item}}, state) do
    case muta.name do
      "enable" -> {:stop, :update, state}
      "delete" -> {:stop, :update, state}
      _ -> {:ok, state}
    end
  end

  def handle_info({{:status, _id}, nil, status}, state) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info({{:dataplot, _self}, nil, data}, state) do
    resp = %{name: "data", args: data}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id}) do
    item = PubSub.Runner.get_head(id)
    config = PubSub.Runner.get_config(id)
    status = PubSub.Status.get_one(id)
    Bus.register!({:error, id})
    Bus.register!({:status, id})
    Bus.register!({:version, id})
    Bus.register!({:dataplot, self()})
    args = %{id: id, type: item.type, name: item.name, config: config, status: status}
    resp = %{name: "init", args: args}
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
    password = PubSub.Password.get_typed(id, @item)

    case Auth.login(session["token"], session["proof"], password) do
      true ->
        Process.send_after(self(), :logged, 0)
        state = Map.put(state, :logged, true)
        resp = %{name: "session", args: session}
        reply_text(resp, state)

      false ->
        resp = %{name: "login", args: %{active: args["active"]}}
        reply_text(resp, state)
    end
  end

  defp handle_event(event = %{"name" => "update"}, state = %{id: id, logged: true}) do
    args = event["args"]
    PubSub.Dataplot.request!(id, args)
    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
