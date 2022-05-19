defmodule Athasha.Auth do
  alias Athasha.License
  alias Athasha.Environ
  alias Athasha.Crypto
  alias Athasha.PubSub
  alias Athasha.Repo

  def count_licenses(identity) do
    pubkey = Environ.load_pubkey()

    # filter by identity
    # database unique index prevents duplicates
    list =
      Repo.all(License)
      |> Enum.filter(fn lic -> lic.identity == identity end)

    Enum.reduce(list, 0, fn lic, count ->
      case Crypto.verify_license(lic, pubkey) do
        true -> count + lic.quantity
        false -> count
      end
    end)
  end

  def logout() do
    PubSub.Logout.dispatch!()
  end

  def login(_token, _proof, nil), do: false

  def login(token, proof, password) do
    proof == Crypto.sha1("#{token}:#{password}")
  end
end
