defmodule AthashaWeb.EditorSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.Item
  alias Athasha.Items

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

  def handle_info({{:status, id}, nil, status}, state = %{id: id}) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info({:logout, nil, _}, state) do
    {:stop, :init, state}
  end

  def handle_info(:logged, state = %{id: id}) do
    item = Items.find_item(id) |> Item.strip()
    Bus.register!({:status, id}, nil)
    Bus.register!(:logout, nil)
    resp = %{name: "edit", args: item}
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

  defp handle_event(event = %{"name" => "login"}, state = %{logged: false}) do
    args = event["args"]
    session = args["session"]
    password = Auth.password()

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

  defp handle_event(event = %{"name" => "update"}, state = %{id: id, logged: true}) do
    args = event["args"]
    Bus.dispatch!({:dataplot, id}, {self(), args})
    {:ok, state}
  end

  defp handle_event(_event, state = %{logged: true}) do
    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
