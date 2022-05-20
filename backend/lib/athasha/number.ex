defmodule Athasha.Number do
  def calibrator(factor, offset) do
    fn value -> calibrate(value, factor, offset) end
  end

  def calibrate(value, 1.0, 0.0), do: value
  def calibrate(value, factor, offset), do: value * factor + offset

  def trimmer(decimals) do
    fn value -> trim(value, decimals) end
  end

  def trim(value, 0) when is_integer(value), do: value

  def trim(value, decimals) when is_integer(value) do
    Decimal.new(value) |> Decimal.round(decimals)
  end

  def trim(value, decimals) when is_float(value) do
    Decimal.from_float(value) |> Decimal.round(decimals)
  end

  def trim(value, decimals) when is_struct(value, Decimal) do
    Decimal.round(value, decimals)
  end
end
