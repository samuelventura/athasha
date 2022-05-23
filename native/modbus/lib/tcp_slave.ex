defmodule Modbus.Tcp.Slave do
  @moduledoc false
  use GenServer
  alias Modbus.Shared
  alias Modbus.Slave

  def start_link(opts) do
    ip = Keyword.get(opts, :ip, {127, 0, 0, 1})
    port = Keyword.get(opts, :port, 0)
    model = Keyword.fetch!(opts, :model)
    trans = Modbus.Tcp.Transport
    proto = Keyword.get(opts, :proto, Modbus.Tcp.Protocol)
    init = %{trans: trans, proto: proto, model: model, port: port, ip: ip}
    name = Keyword.get(opts, :name, nil)

    case name do
      nil -> GenServer.start_link(__MODULE__, init)
      _ -> GenServer.start_link(__MODULE__, init, name: name)
    end
  end

  def init(init) do
    opts = [:binary, ip: init.ip, packet: :raw, active: false, reuseaddr: true]

    case :gen_tcp.listen(init.port, opts) do
      {:ok, listener} ->
        {:ok, {ip, port}} = :inet.sockname(listener)
        {:ok, shared} = Shared.start_link(init.model)

        init = Map.put(init, :ip, ip)
        init = Map.put(init, :port, port)
        init = Map.put(init, :shared, shared)
        init = Map.put(init, :listener, listener)

        spawn_link(fn -> accept(init) end)

        {:ok, init}

      # in this case terminate is not called
      {:error, reason} ->
        {:stop, reason}
    end
  end

  def terminate(reason, %{shared: shared, listener: listener}) do
    # Genserver.stop calls this
    Agent.stop(shared, reason)
    :inet.close(listener)
  end

  def stop(pid) do
    # listener automatic close should
    # close the accepting process which
    # should close all client sockets
    GenServer.stop(pid)
  end

  def port(pid) do
    GenServer.call(pid, :port)
  end

  def get(pid) do
    GenServer.call(pid, :get)
  end

  def set(pid, model) do
    GenServer.call(pid, {:set, model})
  end

  def reset(pid) do
    GenServer.call(pid, :reset)
  end

  def exec(pid, cmd) do
    GenServer.call(pid, {:exec, cmd})
  end

  def handle_call(:port, _from, state) do
    {:reply, state.port, state}
  end

  def handle_call(:get, _from, state) do
    {:reply, Shared.get(state.shared), state}
  end

  def handle_call({:set, model}, _from, state) do
    {:reply, Shared.set(state.shared, model), state}
  end

  def handle_call(:reset, _from, state = %{model: model}) do
    {:reply, Shared.set(state.shared, model), state}
  end

  def handle_call({:exec, cmd}, _from, state) do
    {:reply, Shared.apply(state.shared, cmd), state}
  end

  defp accept(%{shared: shared, proto: proto} = state) do
    case :gen_tcp.accept(state.listener) do
      {:ok, socket} ->
        trans = {state.trans, socket}
        spawn_link(fn -> Slave.client(shared, trans, proto) end)
        accept(state)

      {:error, reason} ->
        # exit abnormally to ensure all clients are killed
        Process.exit(self(), reason)
    end
  end
end
