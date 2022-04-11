defmodule Athasha.Repo.Migrations.CreateSessions do
  use Ecto.Migration

  def change do
    create table(:sessions) do
      add :origin, :string

      timestamps()
    end
  end
end
