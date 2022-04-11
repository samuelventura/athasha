defmodule Athasha.Item do
  use Ecto.Schema
  import Ecto.Changeset

  schema "items" do
    field :config, :string
    field :enabled, :boolean, default: false
    field :name, :string
    field :type, :string
    field :version, :integer

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:name, :type, :version, :enabled, :config])
    |> validate_required([:name, :type, :version, :enabled, :config])
  end
end
