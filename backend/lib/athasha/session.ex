defmodule Athasha.Session do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sessions" do
    field :origin, :string

    timestamps()
  end

  @doc false
  def changeset(session, attrs) do
    session
    |> cast(attrs, [:origin])
    |> validate_required([:origin])
  end
end
