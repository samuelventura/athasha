defmodule AthashaWeb.ItemsSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000
  alias Athasha.Bus
  alias Athasha.Server

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

  def handle_in({text, _opts}, state) do
    event = Jason.decode!(text)
    handle_event(event, state)
  end

  def handle_info(:ping, state) do
    resp = %{name: "ping"}
    reply_text(resp, state)
  end

  def handle_info({:status, nil, status}, state) do
    resp = %{name: "status", args: status}
    reply_text(resp, state)
  end

  def handle_info(:all, state) do
    {:ok, _} = Bus.register(:items, nil)
    {:ok, _} = Bus.register(:status, nil)
    all = Server.all()
    state = Map.put(state, :version, all.version)
    args = %{items: all.items}
    resp = %{name: "all", args: args}
    reply_text(resp, state)
  end

  def handle_info({:items, nil, {:init, _all}}, state) do
    {:stop, :init, state}
  end

  def handle_info({:items, nil, {from, version, muta}}, state) do
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

  def terminate(_reason, _state) do
    :ok
  end

  defp handle_event(%{"name" => "pong"}, state) do
    Process.send_after(self(), :ping, @ping)
    {:ok, state}
  end

  defp handle_event(event = %{"name" => "login"}, state = %{logged: false}) do
    args = event["args"]
    session = args["session"]

    case login(session["token"], session["proof"]) do
      true ->
        Process.send_after(self(), :all, 0)
        state = Map.put(state, :logged, true)
        resp = %{name: "session", args: session}
        reply_text(resp, state)

      false ->
        resp = %{name: "login", args: args["active"]}
        reply_text(resp, state)
    end
  end

  defp handle_event(event, state = %{logged: true}) do
    name = event["name"]
    args = event["args"]

    event =
      case name do
        "rename" ->
          %{name: "rename", args: %{id: args["id"], name: args["name"]}}

        "enable" ->
          %{name: "enable", args: %{id: args["id"], enabled: args["enabled"]}}

        "edit" ->
          %{name: "edit", args: %{id: args["id"], config: args["config"]}}

        "delete" ->
          %{name: "delete", args: %{id: args["id"]}}

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

    # ignore event collision (do not check :ok =)
    Server.apply(event)

    {:ok, state}
  end

  defp reply_text(resp, state) do
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end

  defp password() do
    ""
  end

  defp login(token, proof) do
    proof == sha1("#{token}:#{password()}")
  end

  defp sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end
end
