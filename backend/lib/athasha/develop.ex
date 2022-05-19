defmodule Athasha.Develop do
  alias Athasha.License
  alias Athasha.Environ
  alias Athasha.Crypto
  alias Athasha.Repo

  def insert_license(quantity) do
    lic = generate_license(quantity)
    License.changeset(%License{}, lic) |> Repo.insert()
  end

  def generate_license(quantity) do
    lic = %{
      quantity: quantity,
      purchase: "dev_" <> Ecto.UUID.generate(),
      identity: Environ.load_identity()
    }

    privkey = Environ.load_privkey()
    Crypto.sign_license(lic, privkey)
  end
end
