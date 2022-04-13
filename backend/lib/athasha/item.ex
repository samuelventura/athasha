defmodule Athasha.Item do
  use Ecto.Schema
  import Ecto.Changeset

  schema "items" do
    field(:name, :string)
    field(:type, :string)
    field(:enabled, :boolean, default: false)
    field(:config, :string)

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:name, :type, :enabled, :config])
    |> validate_required([:name, :type, :enabled, :config])
  end
end
