defmodule AthashaWeb.ItemsSocket do
  @behaviour Phoenix.Socket.Transport

  def child_spec(_opts) do
    %{id: __MODULE__, start: {Task, :start_link, [fn -> :ok end]}, restart: :transient}
  end

  def connect(_state) do
    {:ok, %{session: nil}}
  end

  def init(state) do
    send(self(), :login)
    {:ok, state}
  end

  def handle_in({text, _opts}, state) do
    {:reply, :ok, {:text, text}, state}
  end

  def handle_info(:login, state) do
    event = %{name: "login", token: "1"}
    {:reply, :ok, {:text, Jason.encode!(event)}, state}
  end

  def handle_info(_, state) do
    {:ok, state}
  end

  def terminate(_reason, _state) do
    :ok
  end
end
