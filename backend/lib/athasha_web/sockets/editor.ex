defmodule AthashaWeb.Socket.Editor do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.Server
  alias Athasha.PubSub
  alias Athasha.Globals
  alias Athasha.Environ

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(state) do
    params = state.params["id"] |> Base.decode64!() |> Jason.decode!()
    {:ok, %{logged: false, id: params["id"], type: params["type"]}}
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

  def handle_info({{:status, id}, nil, status}, state) do
    status = Map.put(status, :id, id)
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:logged, state = %{id: id}) do
    Bus.register!({:status, id})
    Bus.register!(:version)
    Bus.register!(:logout)
    status = PubSub.Status.get_one(id)
    all = Server.all()
    state = Map.put(state, :version, all.version)
    args = Globals.find_all()
    args = Map.put(args, :items, all.items)
    args = Map.put(args, :status, status)
    resp = %{name: "init", args: args}
    reply_text(resp, state)
  end

  def handle_info({:logout, nil, _}, state) do
    {:stop, :init, state}
  end

  def handle_info({:version, nil, :init}, state) do
    {:stop, :init, state}
  end

  def handle_info({:version, nil, {from, version, muta, _item}}, state) do
    case state.version + 1 do
      ^version ->
        args = muta.args
        muta = Map.put(muta, :version, version)
        muta = Map.put(muta, :self, from == self())
        muta = Map.put(muta, :args, args)
        state = Map.put(state, :version, version)
        reply_text(muta, state)

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
    password = Environ.load_password()

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

  defp handle_event(event, state = %{logged: true, id: id}) do
    name = event["name"]
    args = event["args"]
    # assert
    ^id = args["id"]
    event = fix_event(name, args)
    # ignore event collision (do not check :ok =)
    Server.apply(event)
    {:ok, state}
  end

  defp fix_event(name, args) do
    case name do
      "rename" ->
        %{name: "rename", args: %{id: args["id"], name: args["name"]}}

      "enable" ->
        %{name: "enable", args: %{id: args["id"], enabled: args["enabled"]}}

      "edit" ->
        %{name: "edit", args: %{id: args["id"], config: args["config"]}}
    end
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
