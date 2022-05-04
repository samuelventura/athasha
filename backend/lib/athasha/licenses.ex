defmodule Athasha.Licenses do
  use GenServer
  alias Athasha.Spec
  alias Athasha.Auth
  alias Athasha.Items

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    id = Auth.identity()
    Items.register_identity!(id)
    Items.register_licenses!(Auth.licenses(id))
    {:ok, nil}
  end

  def handle_info(:update, state) do
    id = Auth.identity()
    Items.update_identity!(id)
    Items.update_licenses!(Auth.licenses(id))
    {:noreply, state}
  end
end
