defmodule AthashaWeb.ThermostatLive do
  # In Phoenix v1.6+ apps, the line below should be: use MyAppWeb, :live_view
  use Phoenix.LiveView

  def render(assigns) do
    ~H"""
    Counter: <%= @counter %>
    <button phx-click="increment">Increment</button>
    """
  end

  def mount(_params, %{}, socket) do
    {:ok, assign(socket, :counter, 10)}
  end

  def handle_event("increment", _value, socket) do
    {:noreply, assign(socket, :counter, socket.assigns.counter + 1)}
  end
end
