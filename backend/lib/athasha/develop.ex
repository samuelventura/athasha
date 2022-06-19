defmodule Athasha.Develop do
  alias AthashaWeb.Router
  alias AthashaWeb.Endpoint
  alias Athasha.License
  alias Athasha.Environ
  alias Athasha.Crypto
  alias Athasha.Repo
  alias Athasha.Bus

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

  def write_output(id, value) do
    Bus.dispatch!({:write, id}, value)
  end

  def get_input(point, password \\ "") do
    [id, _name] = String.split(point, " ", parts: 2)
    env = Application.get_env(:athasha, Endpoint)
    http = Keyword.get(env, :http)
    port = Keyword.get(http, :port)
    path = Router.Helpers.tools_path(Endpoint, :get_input)
    url = "http://localhost:#{port}#{path}?id=#{Base.encode64(point)}"

    res =
      case password do
        "" -> HTTPoison.get!(url)
        _ -> HTTPoison.get!(url, "access-password": Crypto.sha1("#{id}:#{password}"))
      end

    {res.status_code, res.body}
  end

  def get_output(point, password \\ "") do
    [id, _name] = String.split(point, " ", parts: 2)
    env = Application.get_env(:athasha, Endpoint)
    http = Keyword.get(env, :http)
    port = Keyword.get(http, :port)
    path = Router.Helpers.tools_path(Endpoint, :get_output)
    url = "http://localhost:#{port}#{path}?id=#{Base.encode64(point)}"

    res =
      case password do
        "" -> HTTPoison.get!(url)
        _ -> HTTPoison.get!(url, "access-password": Crypto.sha1("#{id}:#{password}"))
      end

    {res.status_code, res.body}
  end

  def post_output(point, value, password \\ "") do
    [id, _name] = String.split(point, " ", parts: 2)
    env = Application.get_env(:athasha, Endpoint)
    http = Keyword.get(env, :http)
    port = Keyword.get(http, :port)
    path = Router.Helpers.tools_path(Endpoint, :post_output)
    url = "http://localhost:#{port}#{path}?id=#{Base.encode64(point)}"

    res =
      case password do
        "" -> HTTPoison.post!(url, "#{value}")
        _ -> HTTPoison.post!(url, value, "access-password": Crypto.sha1("#{id}:#{password}"))
      end

    {res.status_code, res.body}
  end

  def kill_named(name, reason \\ :kill) do
    pid = Process.whereis(name)
    Process.exit(pid, reason)
  end
end
