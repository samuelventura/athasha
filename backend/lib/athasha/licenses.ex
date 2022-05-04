defmodule Athasha.Licenses do
  alias Athasha.License
  alias Athasha.Repo

  def quantity() do
    # works with openssl keys but not with ssh-keygen keys
    path = Path.join(:code.priv_dir(:athasha), "athasha.pub")
    pubkey = File.read!(path)
    pubsha1 = sha1(pubkey)
    [pubkey] = :public_key.pem_decode(pubkey)
    pubkey = :public_key.pem_entry_decode(pubkey)

    licenses =
      Repo.all(License)
      |> Enum.reduce(%{}, fn map, lic -> Map.put(map, lic.key, lic) end)

    total =
      Enum.reduce(licenses, 0, fn count, lic ->
        msg = "#{lic.quantity}:#{lic.key}"

        case :public_key.verify(msg, :sha512, lic.signature, pubkey) do
          true -> count + lic.quantity
          false -> count
        end
      end)

    case pubsha1 do
      "c145f9acb4f5b462bbcef81e70feeeea01518876" -> total
      _ -> 0
    end
  end

  defp sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end
end
