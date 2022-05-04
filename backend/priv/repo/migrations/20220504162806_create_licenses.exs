defmodule Athasha.Repo.Migrations.CreateLicenses do
  use Ecto.Migration

  def change do
    create table(:licenses) do
      add(:key, :string)
      add(:identity, :string)
      add(:quantity, :integer)
      add(:signature, :string)

      timestamps()
    end
  end
end
