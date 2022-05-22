defmodule Athasha.Tools do
  alias Athasha.Repo
  alias Athasha.Ports
  alias Athasha.Crypto
  alias Athasha.License
  alias Athasha.Environ
  alias AthashaWeb.Router
  alias AthashaWeb.Endpoint

  def delete_licenses do
    Repo.delete_all(License)
  end

  def load_licenses() do
    Repo.all(License)
    |> Enum.map(fn lic ->
      Map.take(lic, [:purchase, :quantity, :identity, :signature])
    end)
  end

  def insert_licenses(list) do
    received = length(list)
    identity = Environ.load_identity()
    pubkey = Environ.load_pubkey()

    installed =
      Enum.reduce(list, 0, fn lic, count ->
        case lic.identity do
          ^identity ->
            case Crypto.verify_license(lic, pubkey) do
              true ->
                cs = License.changeset(%License{}, lic)

                case Repo.insert(cs) do
                  {:error, _} -> count
                  {:ok, _} -> count + 1
                end

              false ->
                count
            end

          _ ->
            count
        end
      end)

    %{received: received, installed: installed, identity: identity}
  end

  def test_connstr(params) do
    port = Ports.open4("database", [params.database])
    true = Port.command(port, params.connstr)

    receive do
      {^port, {:data, "ok"}} ->
        true = Port.close(port)
        %{result: :ok}

      {^port, {:data, <<"ex:", msg::binary>>}} ->
        true = Port.close(port)
        %{result: :er, error: msg}

      {^port, {:exit_status, status}} ->
        # ** (ArgumentError) argument error :erlang.port_close(#Port<0.17>)
        %{result: :er, error: "Unexpected port exit #{status}"}
    end
  end

  def test_point(point, password \\ "") do
    [id, _name] = String.split(point, " ", parts: 2)
    env = Application.get_env(:athasha, Endpoint)
    http = Keyword.get(env, :http)
    port = Keyword.get(http, :port)
    path = Router.Helpers.tools_path(Endpoint, :get_point)
    url = "http://localhost:#{port}#{path}?id=#{Base.encode64(point)}"

    res =
      case password do
        "" -> HTTPoison.get!(url)
        _ -> HTTPoison.get!(url, "access-password": Crypto.sha1("#{id}:#{password}"))
      end

    {res.status_code, res.body}
  end
end
