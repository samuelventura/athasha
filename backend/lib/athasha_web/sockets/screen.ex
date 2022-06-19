defmodule AthashaWeb.Socket.Screen do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  @item "Screen"
  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.Number
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

  def handle_info({{:screen, _id}, nil, {input, value}}, state) do
    args = %{id: input, value: value}
    resp = %{name: "input", args: args}
    reply_text(resp, state)
  end

  def handle_info({{:screen, _id}, nil, {input, value, dt}}, state) do
    args = %{id: input, value: value, dt: dt}
    resp = %{name: "input", args: args}
    reply_text(resp, state)
  end

  def handle_info({{:status, _id}, nil, status}, state) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id}) do
    Bus.register!({:error, id})
    Bus.register!({:status, id})
    Bus.register!({:screen, id})
    Bus.register!({:version, id})
    init = PubSub.Screen.init!(id)
    resp = %{name: "init", args: init}
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

  defp handle_event(event = %{"name" => "write"}, state = %{logged: true}) do
    args = event["args"]
    name = args["name"]
    value = args["value"]
    string = Map.get(args, "string", false)

    case string do
      true -> Bus.dispatch!({:write, name}, "#{value}")
      false -> Bus.dispatch!({:write, name}, Number.to_number!(value))
    end

    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
