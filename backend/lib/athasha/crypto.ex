defmodule Athasha.Crypto do
  def sha1(data) do
    :crypto.hash(:sha, data) |> Base.encode16() |> String.downcase()
  end

  def sign_license(lic, privkey) do
    msg = "#{lic.quantity}:#{lic.purchase}:#{lic.identity}"
    signature = :public_key.sign(msg, :sha512, privkey) |> Base.encode64()
    Map.put(lic, :signature, signature)
  end

  def verify_license(lic, pubkey) do
    msg = "#{lic.quantity}:#{lic.purchase}:#{lic.identity}"
    signature = lic.signature |> Base.decode64!()
    :public_key.verify(msg, :sha512, signature, pubkey)
  end
end
