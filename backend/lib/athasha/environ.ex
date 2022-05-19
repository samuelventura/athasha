defmodule Athasha.Environ do
  alias Athasha.Ports
  alias Athasha.Crypto

  def load_pubkey() do
    # works with openssl keys but not with ssh-keygen keys
    pubsha1 = "c145f9acb4f5b462bbcef81e70feeeea01518876"
    path = Path.join(:code.priv_dir(:athasha), "athasha.pub")
    pubkey = File.read!(path)
    ^pubsha1 = Crypto.sha1(pubkey)
    [pubkey] = :public_key.pem_decode(pubkey)
    :public_key.pem_entry_decode(pubkey)
  end

  def load_privkey() do
    home = System.user_home!()
    path = Path.join([home, ".athasha", "athasha.pem"])
    pem = File.read!(path)
    [privkey] = :public_key.pem_decode(pem)
    :public_key.pem_entry_decode(privkey)
  end

  def load_password() do
    case File.read(password_file()) do
      {:ok, data} -> String.trim(data)
      _ -> ""
    end
  end

  def save_password(password) do
    File.write!(password_file(), password)
  end

  defp password_file() do
    root_path = Application.get_env(:athasha, :root_path)
    Path.join(root_path, "athasha.config.pwd")
  end

  def load_identity() do
    [line] = Ports.read_lines("identity")
    line
  end

  def load_hostname() do
    {:ok, hostname} = :inet.gethostname()
    to_string(hostname)
  end

  def load_addresses() do
    {:ok, triples} = :inet.getif()
    triples = Enum.filter(triples, &is_not_localhost/1)

    Enum.map(triples, fn triple ->
      {{oct1, oct2, oct3, oct4}, _broadcast, _mask} = triple
      "#{oct1}.#{oct2}.#{oct3}.#{oct4}"
    end)
  end

  defp is_not_localhost({{127, 0, 0, 1}, _broadcast, _mask}), do: false
  defp is_not_localhost({_ip, _broadcast, _mask}), do: true
end
