defmodule AthashaWeb.Socket.Points do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
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
  def handle_info({{:items, _id}, nil, {_from, _version, muta, _item}}, state) do
    case muta.name do
      "enable" -> {:stop, :update, state}
      "delete" -> {:stop, :update, state}
      _ -> {:ok, state}
    end
  end

  def handle_info({{:input, _id}, nil, {name, value}}, state) do
    args = %{name: name, value: value}
    resp = %{name: "input", args: args}
    reply_text(resp, state)
  end

  def handle_info({{:output, _id}, nil, {name, value}}, state) do
    args = %{name: name, value: value}
    resp = %{name: "output", args: args}
    reply_text(resp, state)
  end

  def handle_info({{:status, _id}, nil, status}, state) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id, item: item}) do
    Bus.register!({:error, id})
    Bus.register!({:status, id})
    Bus.register!({:input, id})
    Bus.register!({:output, id})
    Bus.register!({:items, id})

    args = %{
      id: id,
      type: item.type,
      name: item.name,
      ivalues: PubSub.Input.get_values(id) |> Enum.map(&initial_point/1),
      inames: PubSub.Input.get_names(id),
      ovalues: PubSub.Output.get_values(id) |> Enum.map(&initial_point/1),
      onames: PubSub.Output.get_names(id)
    }

    resp = %{name: "view", args: args}
    state = Map.put(state, :type, item.type)
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
    item = PubSub.Runner.find(id)

    type =
      case item do
        nil -> nil
        _ -> item.type
      end

    password = PubSub.Password.find_typed(id, type)

    case Auth.login(session["token"], session["proof"], password) do
      true ->
        Process.send_after(self(), :logged, 0)
        state = Map.put(state, :logged, true)
        state = Map.put(state, :item, item)
        resp = %{name: "session", args: session}
        reply_text(resp, state)

      false ->
        resp = %{name: "login", args: args["active"]}
        reply_text(resp, state)
    end
  end

  defp handle_event(event = %{"name" => "write"}, state = %{id: id, logged: true}) do
    args = event["args"]
    name = args["name"]
    value = Number.to_number!(args["value"])
    Bus.dispatch!({:write, "#{id} #{name}"}, value)
    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end

  defp initial_point({name, value}) do
    %{name: name, value: value}
  end
end
