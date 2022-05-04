defmodule Athasha.License do
  use Ecto.Schema
  import Ecto.Changeset

  schema "licenses" do
    field(:key, :string)
    field(:quantity, :integer)
    field(:signature, :string)

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:key, :quantity, :signature])
    |> validate_required([:key, :quantity, :signature])
  end
end
