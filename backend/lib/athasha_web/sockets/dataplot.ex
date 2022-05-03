defmodule AthashaWeb.DataplotSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  @item "Dataplot"
  alias Athasha.Bus
  alias Athasha.Items

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

  # disconnect on any item change but not status change
  def handle_info({{:item, _}, nil, _}, state) do
    {:stop, :update, state}
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
    item = Items.find_runner(id)
    Bus.register!({:status, id}, nil)
    Bus.register!({:screen, id}, nil)
    Bus.register!({:item, id}, nil)
    config = item.config
    args = %{id: id, type: item.type, name: item.name, config: config}
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
    password = Items.find_password(id, @item)

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

  defp login(_token, _proof, nil), do: false

  defp login(token, proof, password) do
    proof == sha1("#{token}:#{password}")
  end

  defp sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end
end
