defmodule Athasha.Globals do
  use GenServer
  alias Athasha.Spec
  alias Athasha.Auth
  alias Athasha.Store
  alias Athasha.Environ

  @key :global

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def init(_initial) do
    all = load_all()
    register!(:identity, all.identity)
    register!(:licenses, all.licenses)
    register!(:hostname, all.hostname)
    register!(:addresses, all.addresses)
    {:ok, all}
  end

  def handle_call(:update, _from, _state) do
    all = load_all()
    update!(:identity, all.identity)
    update!(:licenses, all.licenses)
    update!(:hostname, all.hostname)
    update!(:addresses, all.addresses)
    {:reply, all, all}
  end

  def update() do
    GenServer.call(__MODULE__, :update)
  end

  def load_all() do
    identity = Environ.load_identity()

    %{
      identity: identity,
      licenses: Auth.count_licenses(identity),
      hostname: Environ.load_hostname(),
      addresses: Environ.load_addresses()
    }
  end

  def find_all() do
    %{
      identity: find_identity(),
      licenses: find_licenses(),
      hostname: find_hostname(),
      addresses: find_addresses()
    }
  end

  def find_identity(), do: find(:identity)
  def find_licenses(), do: find(:licenses)
  def find_hostname(), do: find(:hostname)
  def find_addresses(), do: find(:addresses)

  defp find(key) do
    case Store.lookup({@key, key}) do
      [{_, value}] -> value
      [] -> nil
    end
  end

  defp register!(key, value) do
    Store.register!({@key, key}, value)
  end

  defp update!(key, value) do
    Store.update!({@key, key}, fn _ -> value end)
  end
end
