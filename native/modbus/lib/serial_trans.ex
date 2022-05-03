defmodule Modbus.Serial.Transport do
  @behaviour Modbus.Transport
  @moduledoc false
  alias Modbus.Sport

  def open(opts) do
    device = Keyword.fetch!(opts, :device)
    speed = Keyword.get(opts, :speed, 9600)
    config = Keyword.get(opts, :config, "8N1")
    Sport.open(device, speed, config)
  end

  def master_reqres(port, packet, count, timeout) do
    Sport.master_reqres(port, packet, count, timeout)
  end

  def slave_waitreq(port) do
    Sport.slave_waitreq(port)
  end

  def slave_sendres(port, packet) do
    Sport.write(port, packet)
  end

  def close(port) do
    Sport.close(port)
  end
end
