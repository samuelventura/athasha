defmodule Athasha.Repo.Migrations.CreateItems do
  use Ecto.Migration

  def change do
    create table(:items, primary_key: false) do
      add(:id, :uuid, primary_key: true, null: false)
      add(:name, :string, null: false)
      add(:type, :string, null: false)
      add(:enabled, :boolean, null: false, default: false)
      add(:config, :map, null: false)

      timestamps()
    end
  end
end
