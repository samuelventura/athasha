defmodule Athasha.License do
  use Ecto.Schema
  import Ecto.Changeset

  schema "licenses" do
    field(:key, :string)
    field(:identity, :string)
    field(:quantity, :integer)
    field(:signature, :string)

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:key, :identity, :quantity, :signature])
    |> validate_required([:key, :identity, :quantity, :signature])
    |> unique_constraint([:key])
  end
end
