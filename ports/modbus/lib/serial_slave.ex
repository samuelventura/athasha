defmodule Modbus.Serial.Slave do
  @moduledoc false
  alias Modbus.Transport
  alias Modbus.Shared
  alias Modbus.Slave

  def start_link(opts) do
    model = Keyword.fetch!(opts, :model)
    protom = Keyword.get(opts, :proto, Modbus.Rtu.Protocol)
    transm = Modbus.Serial.Transport
    init = %{trans: transm, proto: protom, model: model, opts: opts}
    GenServer.start_link(__MODULE__.Server, init)
  end

  def stop(pid) do
    GenServer.stop(pid)
  end

  defmodule Server do
    @moduledoc false
    use GenServer

    def init(init) do
      %{trans: transm, proto: proto, model: model, opts: opts} = init
      {:ok, shared} = Shared.start_link(model)

      parent = self()

      client =
        spawn_link(fn ->
          send(parent, Transport.open(transm, opts))

          receive do
            next -> next.()
          end
        end)

      result =
        receive do
          any -> any
        end

      case result do
        {:ok, transi} ->
          trans = {transm, transi}
          send(client, fn -> Slave.client(shared, trans, proto) end)
          state = %{client: client, shared: shared}
          {:ok, state}

        {:error, reason} ->
          {:stop, reason}
      end
    end

    def terminate(reason, %{client: client, shared: shared}) do
      Process.unlink(client)
      Process.exit(client, :kill)
      Agent.stop(shared, reason)
    end
  end
end
