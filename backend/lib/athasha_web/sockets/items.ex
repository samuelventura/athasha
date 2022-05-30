defmodule AthashaWeb.Socket.Items do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Auth
  alias Athasha.Item
  alias Athasha.Server
  alias Athasha.PubSub
  alias Athasha.Globals
  alias Athasha.Environ

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
    Bus.register!(:status)
    Bus.register!(:version)
    Bus.register!(:logout)
    status = PubSub.Status.get_all()
    all = Server.all()
    state = Map.put(state, :version, all.version)
    args = Globals.find_all()
    items = Enum.map(all.items, &Item.head(&1))
    args = Map.put(args, :items, items)
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

  def handle_info({:version, nil, {from, version, muta, item}}, state) do
    # do not handle "edit" in separated method without updating state version
    case state.version + 1 do
      ^version ->
        case muta.name do
          "edit" ->
            state = Map.put(state, :version, version)
            {:ok, state}

          _ ->
            item = Item.head(item)
            args = %{id: item.id, item: item}
            muta = Map.put(muta, :version, version)
            muta = Map.put(muta, :self, from == self())
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

  defp handle_event(%{"name" => "backup-all"}, state = %{logged: true}) do
    all = Server.all()
    args = %{hostname: Globals.find_hostname(), items: all.items}
    resp = %{name: "backup-all", args: args}
    reply_text(resp, state)
  end

  defp handle_event(event = %{"name" => "backup-one"}, state = %{logged: true}) do
    args = event["args"]
    id = args["id"]
    one = Server.one(id)
    resp = %{name: "backup-one", args: one.item}
    reply_text(resp, state)
  end

  defp handle_event(event = %{"name" => "restore"}, state = %{logged: true}) do
    name = event["name"]

    args =
      Enum.map(event["args"], fn item ->
        %{
          id: item["id"],
          name: item["name"],
          type: item["type"],
          enabled: item["enabled"],
          config: item["config"]
        }
      end)

    Server.apply(%{name: name, args: args})

    {:ok, state}
  end

  defp handle_event(event, state = %{logged: true}) do
    name = event["name"]
    args = event["args"]
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

      "delete" ->
        %{name: "delete", args: %{id: args["id"]}}

      "clone" ->
        %{name: "clone", args: %{id: args["id"]}}

      "create" ->
        %{
          name: "create",
          args: %{
            name: args["name"],
            type: args["type"],
            enabled: args["enabled"],
            config: args["config"]
          }
        }
    end
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end
end
