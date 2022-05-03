defmodule Modbus.Transport do
  @moduledoc false
  @callback open(opts :: keyword()) ::
              {:ok, id :: any()} | {:error, reason :: any()}
  @callback master_reqres(
              id :: any(),
              packet :: binary(),
              count :: integer(),
              timeout :: integer()
            ) ::
              {:ok, packet :: binary()} | {:error, reason :: any()}
  @callback slave_waitreq(id :: any()) :: {:ok, packet :: binary()} | {:error, reason :: any()}
  @callback slave_sendres(id :: any(), packet :: binary()) ::
              {:ok, packet :: binary()} | {:error, reason :: any()}
  @callback close(id :: any()) :: :ok | {:error, reason :: any()}

  def open(mod, opts) do
    mod.open(opts)
  end

  def master_reqres({mod, id}, packet, count, timeout) do
    mod.master_reqres(id, packet, count, timeout)
  end

  def slave_waitreq({mod, id}) do
    mod.slave_waitreq(id)
  end

  def slave_sendres({mod, id}, packet) do
    mod.slave_sendres(id, packet)
  end

  def close({mod, id}) do
    mod.close(id)
  end
end
