defmodule Athasha.Device do
  use Ecto.Schema
  import Ecto.Changeset

  schema "devices" do
    field :config, :string
    field :name, :string
    field :type, :string
    field :version, :integer

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    device
    |> cast(attrs, [:name, :type, :version, :config])
    |> validate_required([:name, :type, :version, :config])
  end
end
