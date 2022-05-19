defmodule Athasha.Repo.Migrations.CreateLicenses do
  use Ecto.Migration

  def change do
    create table(:licenses) do
      add(:purchase, :string)
      add(:identity, :string)
      add(:quantity, :integer)
      add(:signature, :string)

      timestamps()
    end

    create(unique_index(:licenses, :purchase))
  end
end
