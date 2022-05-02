defmodule Modbus.Serial.Transport do
  @behaviour Modbus.Transport
  @moduledoc false
  alias Modbus.Sport

  # silent period for slave reads is speed dependent
  # 9600 requires silent ~ 10
  # 115200 works with silent = 1
  # no calculation effort will solve the unreliability of the PC timing
  # will leave a working value for the minimal typical speed which is 9600
  @silent 10

  def open(opts) do
    device = Keyword.fetch!(opts, :device)
    speed = Keyword.get(opts, :speed, 9600)
    config = Keyword.get(opts, :config, "8N1")
    Sport.open(device, speed, config)
  end

  def readp(port) do
    scanp(port)
  end

  def readn(port, count, timeout) do
    dl = millis() + timeout
    scann(port, count, dl)
  end

  def write(port, packet) do
    Sport.read(port)
    Sport.write(port, packet)
  end

  def close(port) do
    Sport.close(port)
  end

  defp scann(port, count, dl) do
    Stream.iterate(0, &(&1 + 1))
    |> Enum.reduce_while(<<>>, fn i, buf ->
      if i > 0, do: :timer.sleep(1)

      case Sport.read(port) do
        {:ok, data} ->
          buf = buf <> data

          case byte_size(buf) >= count do
            true ->
              {:halt, {:ok, buf}}

            false ->
              case millis() > dl do
                true -> {:halt, {:error, {:timeout, buf}}}
                false -> {:cont, buf}
              end
          end

        {:error, reason} ->
          {:halt, {:error, {reason, buf}}}
      end
    end)
  end

  defp scanp(port) do
    Stream.iterate(0, &(&1 + 1))
    |> Enum.reduce_while({0, <<>>}, fn i, {count, buf} ->
      if i > 0, do: :timer.sleep(1)

      case Sport.read(port) do
        {:ok, data} ->
          case {buf, data} do
            {<<>>, <<>>} ->
              {:cont, {0, <<>>}}

            {<<>>, _} ->
              {:cont, {0, data}}

            {_, <<>>} ->
              cond do
                count > @silent -> {:halt, {:ok, buf}}
                true -> {:cont, {count + 1, buf}}
              end

            {_, _} ->
              {:cont, {count + 1, buf <> data}}
          end

        {:error, reason} ->
          {:halt, {:error, {reason, buf}}}
      end
    end)
  end

  defp millis() do
    System.monotonic_time(:millisecond)
  end
end
