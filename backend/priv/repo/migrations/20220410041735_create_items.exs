defmodule Athasha.Repo.Migrations.CreateItems do
  use Ecto.Migration

  def change do
    create table(:items) do
      add :name, :string
      add :type, :string
      add :version, :integer
      add :config, :string

      timestamps()
    end
  end
end
