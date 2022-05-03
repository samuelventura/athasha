defmodule Modbus.Slave do
  @moduledoc false
  alias Modbus.Transport
  alias Modbus.Protocol
  alias Modbus.Shared

  def client(shared, trans, proto) do
    case Transport.slave_waitreq(trans) do
      {:ok, data} ->
        {cmd, tid} = Protocol.parse_req(proto, data)

        case Shared.apply(shared, cmd) do
          :ok ->
            resp = Protocol.pack_res(proto, cmd, nil, tid)
            Transport.slave_sendres(trans, resp)

          {:ok, values} ->
            resp = Protocol.pack_res(proto, cmd, values, tid)
            Transport.slave_sendres(trans, resp)

          _ ->
            :ignore
        end

        client(shared, trans, proto)

      {:error, reason} ->
        Process.exit(self(), reason)
    end
  end
end
