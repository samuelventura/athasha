defmodule Athasha.Tools do
  alias Athasha.Repo
  alias Athasha.Globals
  alias Athasha.License

  def licenses() do
    Repo.all(License)
    |> Enum.map(fn lic ->
      Map.take(lic, [:key, :quantity, :identity, :signature])
    end)
  end

  def add_licenses(list) do
    received = length(list)
    identity = Globals.find_identity()

    installed =
      Enum.reduce(list, 0, fn lic, count ->
        case lic["identity"] do
          ^identity ->
            cs = License.changeset(%License{}, lic)

            case Repo.insert(cs) do
              {:error, _} -> count
              {:ok, _} -> count + 1
            end

          _ ->
            count
        end
      end)

    %{received: received, installed: installed, identity: identity}
  end

  def hostname() do
    {:ok, hostname} = :inet.gethostname()
    to_string(hostname)
  end

  def ips() do
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
