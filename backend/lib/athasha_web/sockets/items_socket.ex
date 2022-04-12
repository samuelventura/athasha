defmodule AthashaWeb.ItemsSocket do
  @behaviour Phoenix.Socket.Transport
  @ping 5000

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(_state) do
    IO.inspect(_state)
    {:ok, %{logged: false}}
  end

  def init(state) do
    Process.send_after(self(), :ping, @ping)
    {:ok, state}
  end

  def handle_in({text, _opts}, state) do
    event = Jason.decode!(text)
    IO.inspect(event)

    case event do
      %{"name" => "pong"} ->
        Process.send_after(self(), :ping, @ping)
        {:ok, state}

      %{"name" => "login"} ->
        args = event["args"]
        session = args["session"]

        case login(session["token"], session["proof"]) do
          true ->
            state = Map.put(state, :logged, true)
            resp = %{name: "session", args: session}
            json = Jason.encode!(resp)
            {:reply, :ok, {:text, json}, state}

          false ->
            resp = %{name: "login", args: args["active"]}
            json = Jason.encode!(resp)
            {:reply, :ok, {:text, json}, state}
        end
    end
  end

  def handle_info(:ping, state) do
    resp = %{name: "ping"}
    json = Jason.encode!(resp)
    {:reply, :ok, {:text, json}, state}
  end

  def handle_info(_, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
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
