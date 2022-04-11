defmodule Athasha.ItemsServer do
  use GenServer

  alias Athasha.Spec
  alias Athasha.Repo
  alias Athasha.Item
  alias Athasha.Registry

  def child_spec(_) do
    Spec.for(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, name: __MODULE__)
  end

  def init(_initial) do
    items =
      Repo.all(Item)
      |> Enum.into(%{}, &map/1)

    {:ok, items}
  end

  def handle_call(%{"action" => "enable", "id" => _id}, _from, _items) do
  end

  defp map({_index, item}) do
    {item.id, item}
  end
end
