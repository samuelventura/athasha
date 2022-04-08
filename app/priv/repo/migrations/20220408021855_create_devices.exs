defmodule Athasha.Repo.Migrations.CreateDevices do
  use Ecto.Migration

  def change do
    create table(:devices) do
      add :name, :string
      add :type, :string
      add :version, :integer
      add :config, :string

      timestamps()
    end
  end
end
