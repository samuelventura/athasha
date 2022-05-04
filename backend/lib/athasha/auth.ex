defmodule Athasha.Auth do
  alias Athasha.License
  alias Athasha.Ports
  alias Athasha.Repo

  def licenses() do
    id = identity()
    # works with openssl keys but not with ssh-keygen keys
    path = Path.join(:code.priv_dir(:athasha), "athasha.pub")
    pubkey = File.read!(path)
    pubsha1 = sha1(pubkey)
    [pubkey] = :public_key.pem_decode(pubkey)
    pubkey = :public_key.pem_entry_decode(pubkey)

    # last wins on duplicates
    map =
      Repo.all(License)
      |> Enum.reduce(%{}, fn lic, map ->
        case lic.identity do
          ^id -> Map.put(map, lic.key, lic)
          _ -> map
        end
      end)

    total =
      Enum.reduce(map, 0, fn {_, lic}, count ->
        msg = message(lic.quantity, lic.key, id)
        signature = lic.signature |> Base.decode64!()

        case :public_key.verify(msg, :sha512, signature, pubkey) do
          true -> count + lic.quantity
          false -> count
        end
      end)

    case pubsha1 do
      "c145f9acb4f5b462bbcef81e70feeeea01518876" -> total
      _ -> 0
    end
  end

  def password() do
    ""
  end

  def login(_token, _proof, nil), do: false

  def login(token, proof, password) do
    proof == sha1("#{token}:#{password}")
  end

  def sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end

  def identity() do
    [line] = Ports.read_lines("identity")
    line
  end

  def message(quantity, key, identity) do
    "#{quantity}:#{key}:#{identity}"
  end

  def insert_local(quantity, key) do
    license = generate_local(quantity, key)
    License.changeset(%License{}, license) |> Repo.insert()
  end

  def generate_local(quantity, key) do
    home = System.user_home!()
    path = Path.join([home, ".ssh", "athasha.pem"])
    generate(quantity, key, identity(), path)
  end

  def generate(quantity, key, identity, path) do
    pem = File.read!(path)
    [privkey] = :public_key.pem_decode(pem)
    privkey = :public_key.pem_entry_decode(privkey)
    msg = message(quantity, key, identity)
    signature = :public_key.sign(msg, :sha512, privkey) |> Base.encode64()
    %{key: key, quantity: quantity, identity: identity, signature: signature}
  end
end
