defmodule AthashaWeb.ViewSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Items

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    ids = state.params["id"]
    {id, _} = Integer.parse(ids)
    item = Items.find_item(id, "Screen")

    case item do
      nil ->
        {:error, {:nf, id}}

      _ ->
        config = Jason.decode!(item.config)
        {:ok, %{logged: false, id: id, item: item, config: config}}
    end
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

  def handle_info({{:item, id}, nil, _}, state = %{id: id}) do
    {:stop, :update, state}
  end

  def handle_info({{:item, _}, _, _}, state) do
    {:ok, state}
  end

  def handle_info({{:screen, id}, nil, {point, value}}, state = %{id: id}) do
    args = %{id: point, value: value}
    resp = %{name: "point", args: args}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id, item: item, config: config}) do
    Bus.register!({:item, id}, nil)
    Bus.register!({:screen, id}, nil)
    args = %{id: id, name: item.name, config: config}
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

  defp handle_event(event = %{"name" => "login"}, state = %{logged: false}) do
    args = event["args"]
    session = args["session"]
    password = state.config["setts"]["password"]

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

  defp login(token, proof, password) do
    proof == sha1("#{token}:#{password}")
  end

  defp sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end
end
