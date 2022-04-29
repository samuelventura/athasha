defmodule AthashaWeb.ViewSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Items
  alias Athasha.Points

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    ids = state.params["id"]
    {id, _} = Integer.parse(ids)
    {:ok, %{logged: false, id: id}}
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

  def handle_info({{:item, _}, nil, _}, state) do
    {:stop, :update, state}
  end

  def handle_info({{:screen, id}, nil, {point, value}}, state = %{id: id}) do
    args = %{id: point, value: value}
    resp = %{name: "point", args: args}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id}) do
    item = Items.find_item(id)

    initial =
      case item.type do
        "Screen" ->
          Bus.register!({:screen, id}, nil)
          Points.screen_points(id) |> Enum.map(&initial_point/1)
      end

    # disconnect on any item change but not status change
    Bus.register!({:item, id}, nil)
    config = Jason.decode!(item.config)
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
    password = Items.find_password(id)

    case login(session["token"], session["proof"], password) do
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

  defp handle_event(_event, state = %{logged: true}) do
    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end

  defp initial_point({id, _, value}) do
    %{id: id, value: value}
  end

  defp login(_token, _proof, nil), do: false

  defp login(token, proof, password) do
    proof == sha1("#{token}:#{password}")
  end

  defp sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end
end
