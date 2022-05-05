defmodule Athasha.Globals do
  use GenServer
  alias Athasha.Spec
  alias Athasha.Auth
  alias Athasha.Tools
  alias Athasha.Store

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    GenServer.start_link(__MODULE__, nil, name: __MODULE__)
  end

  def update() do
    Process.send(__MODULE__, :update, [])
  end

  def info() do
    %{
      identity: find_identity(),
      licenses: find_licenses(),
      hostname: find_hostname(),
      ips: find_ips()
    }
  end

  def find_licenses() do
    case Store.lookup({:licenses}) do
      [{_, licenses}] -> licenses
      [] -> nil
    end
  end

  def find_identity() do
    case Store.lookup({:identity}) do
      [{_, identity}] -> identity
      [] -> nil
    end
  end

  def find_hostname() do
    case Store.lookup({:hostname}) do
      [{_, hostname}] -> hostname
      [] -> nil
    end
  end

  def find_ips() do
    case Store.lookup({:ips}) do
      [{_, ips}] -> ips
      [] -> nil
    end
  end

  def init(_initial) do
    identity = Auth.identity()
    register_identity!(identity)
    register_licenses!(Auth.licenses(identity))
    register_hostname!(Tools.hostname())
    register_ips!(Tools.ips())
    {:ok, nil}
  end

  def handle_info(:update, state) do
    identity = Auth.identity()
    update_identity!(identity)
    update_licenses!(Auth.licenses(identity))
    update_hostname!(Tools.hostname())
    update_ips!(Tools.ips())
    {:noreply, state}
  end

  defp register_ips!(ips) do
    Store.register!({:ips}, ips)
  end

  defp update_ips!(ips) do
    Store.update!({:ips}, fn _ -> ips end)
  end

  defp register_hostname!(hostname) do
    Store.register!({:hostname}, hostname)
  end

  defp update_hostname!(hostname) do
    Store.update!({:hostname}, fn _ -> hostname end)
  end

  defp register_identity!(identity) do
    Store.register!({:identity}, identity)
  end

  defp update_identity!(identity) do
    Store.update!({:identity}, fn _ -> identity end)
  end

  defp register_licenses!(licenses) do
    Store.register!({:licenses}, licenses)
  end

  defp update_licenses!(licenses) do
    Store.update!({:licenses}, fn _ -> licenses end)
  end
end
