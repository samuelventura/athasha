defmodule Athasha.Repo.Migrations.CreateSessions do
  use Ecto.Migration

  def change do
    create table(:sessions) do
      add(:token, :string)

      timestamps()
    end
  end
end
