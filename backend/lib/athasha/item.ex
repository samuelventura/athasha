defmodule Athasha.Item do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}

  schema "items" do
    field(:name, :string)
    field(:type, :string)
    field(:enabled, :boolean, default: false)
    field(:config, :map)

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:name, :type, :enabled, :config])
    |> validate_required([:name, :type, :enabled, :config])
  end

  def changeset(item, attrs, :id) do
    changeset(item, attrs) |> cast(attrs, [:id])
  end
end
