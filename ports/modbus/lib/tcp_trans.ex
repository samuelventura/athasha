defmodule Modbus.Tcp.Transport do
  @moduledoc false
  @behaviour Modbus.Transport
  @to 2000

  def open(opts) do
    ip = Keyword.fetch!(opts, :ip)
    port = Keyword.fetch!(opts, :port)
    timeout = Keyword.get(opts, :timeout, @to)
    opts = [:binary, packet: :raw, active: false]
    :gen_tcp.connect(ip, port, opts, timeout)
  end

  def master_reqres(socket, packet, count, timeout) do
    # discard before send
    :gen_tcp.recv(socket, 0, 0)
    :gen_tcp.send(socket, packet)
    :gen_tcp.recv(socket, count, timeout)
  end

  def slave_waitreq(socket) do
    :gen_tcp.recv(socket, 0)
  end

  def slave_sendres(socket, packet) do
    :gen_tcp.send(socket, packet)
  end

  def close(socket) do
    :gen_tcp.close(socket)
  end
end
