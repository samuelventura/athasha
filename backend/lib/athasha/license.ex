defmodule Athasha.License do
  use Ecto.Schema
  import Ecto.Changeset

  schema "licenses" do
    field(:purchase, :string)
    field(:identity, :string)
    field(:quantity, :integer)
    field(:signature, :string)

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:purchase, :identity, :quantity, :signature])
    |> validate_required([:purchase, :identity, :quantity, :signature])
    |> unique_constraint([:purchase])
  end
end
