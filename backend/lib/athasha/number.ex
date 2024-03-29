defmodule Athasha.Number do
  # default is big-unsigned-integer-8

  def parse_float!(str) do
    {value, ""} = Float.parse(str)
    value
  end

  def parse_number!(str) do
    case String.contains?(str, ".") do
      true -> parse_float!(str)
      false -> String.to_integer(str)
    end
  end

  def type_of(value) when is_float(value), do: "float"
  def type_of(value) when is_integer(value), do: "integer"

  def to_number!(value) when is_integer(value), do: value
  def to_number!(value) when is_float(value), do: value
  def to_number!(value) when is_binary(value), do: parse_number!(value)

  def calibrator(factor, offset) do
    fn value -> calibrate(value, factor, offset) end
  end

  def calibrate(value, 1.0, 0.0), do: value
  def calibrate(value, factor, offset), do: value * factor + offset
  def reversed(factor, offset), do: calibrator(1 / factor, -offset / factor)

  def to_uint16(value) when value > 65535, do: 65535
  def to_uint16(value) when value < 0, do: 0
  def to_uint16(value) when is_integer(value), do: value
  def to_uint16(value) when is_float(value), do: round(value) |> trunc

  def to_sint16(value) when value > 32767, do: 32767
  def to_sint16(value) when value < -32768, do: -32768
  def to_sint16(value) when is_integer(value), do: value
  def to_sint16(value) when is_float(value), do: round(value) |> trunc

  def to_uint32(value) when value > 4_294_967_295, do: 4_294_967_295
  def to_uint32(value) when value < 0, do: 0
  def to_uint32(value) when is_integer(value), do: value
  def to_uint32(value) when is_float(value), do: round(value) |> trunc

  def to_sint32(value) when value > 2_147_483_647, do: 2_147_483_647
  def to_sint32(value) when value < -2_147_483_648, do: -2_147_483_648
  def to_sint32(value) when is_integer(value), do: value
  def to_sint32(value) when is_float(value), do: round(value) |> trunc

  def to_bit(0), do: 0
  def to_bit(0.0), do: 0
  def to_bit(_), do: 1

  # R
  def r_u16be(w16) do
    <<value::unsigned-integer-big-16>> = <<w16::16>>
    value
  end

  def r_s16be(w16) do
    <<value::signed-integer-big-16>> = <<w16::16>>
    value
  end

  def r_u16le(w16) do
    <<value::unsigned-integer-little-16>> = <<w16::16>>
    value
  end

  def r_s16le(w16) do
    <<value::signed-integer-little-16>> = <<w16::16>>
    value
  end

  # RF32
  def r_f32bed([w0, w1]) do
    <<value::float-big-32>> = <<w0::16, w1::16>>
    value
  end

  def r_f32led([w0, w1]) do
    <<value::float-little-32>> = <<w0::16, w1::16>>
    value
  end

  def r_f32ber([w0, w1]) do
    <<value::float-big-32>> = <<w1::16, w0::16>>
    value
  end

  def r_f32ler([w0, w1]) do
    <<value::float-little-32>> = <<w1::16, w0::16>>
    value
  end

  # RS32
  def r_s32bed([w0, w1]) do
    <<value::signed-integer-big-32>> = <<w0::16, w1::16>>
    value
  end

  def r_s32led([w0, w1]) do
    <<value::signed-integer-little-32>> = <<w0::16, w1::16>>
    value
  end

  def r_s32ber([w0, w1]) do
    <<value::signed-integer-big-32>> = <<w1::16, w0::16>>
    value
  end

  def r_s32ler([w0, w1]) do
    <<value::signed-integer-little-32>> = <<w1::16, w0::16>>
    value
  end

  # RU32
  def r_u32bed([w0, w1]) do
    <<value::unsigned-integer-big-32>> = <<w0::16, w1::16>>
    value
  end

  def r_u32led([w0, w1]) do
    <<value::unsigned-integer-little-32>> = <<w0::16, w1::16>>
    value
  end

  def r_u32ber([w0, w1]) do
    <<value::unsigned-integer-big-32>> = <<w1::16, w0::16>>
    value
  end

  def r_u32ler([w0, w1]) do
    <<value::unsigned-integer-little-32>> = <<w1::16, w0::16>>
    value
  end

  # W
  def w_u16be(value) do
    value = to_uint16(value)
    <<w16::16>> = <<value::unsigned-integer-big-16>>
    w16
  end

  def w_s16be(value) do
    value = to_sint16(value)
    <<w16::16>> = <<value::signed-integer-big-16>>
    w16
  end

  def w_u16le(value) do
    value = to_uint16(value)
    <<w16::16>> = <<value::unsigned-integer-little-16>>
    w16
  end

  def w_s16le(value) do
    value = to_sint16(value)
    <<w16::16>> = <<value::signed-integer-little-16>>
    w16
  end

  # WF32
  def w_f32bed(value) do
    value = :erlang.float(value)
    <<w0::16, w1::16>> = <<value::float-big-32>>
    [w0, w1]
  end

  def w_f32led(value) do
    value = :erlang.float(value)
    <<w0::16, w1::16>> = <<value::float-little-32>>
    [w0, w1]
  end

  def w_f32ber(value) do
    value = :erlang.float(value)
    <<w1::16, w0::16>> = <<value::float-big-32>>
    [w0, w1]
  end

  def w_f32ler(value) do
    value = :erlang.float(value)
    <<w1::16, w0::16>> = <<value::float-little-32>>
    [w0, w1]
  end

  # WS32
  def w_s32bed(value) do
    value = to_sint32(value)
    <<w0::16, w1::16>> = <<value::signed-integer-big-32>>
    [w0, w1]
  end

  def w_s32led(value) do
    value = to_sint32(value)
    <<w0::16, w1::16>> = <<value::signed-integer-little-32>>
    [w0, w1]
  end

  def w_s32ber(value) do
    value = to_sint32(value)
    <<w1::16, w0::16>> = <<value::signed-integer-big-32>>
    [w0, w1]
  end

  def w_s32ler(value) do
    value = to_sint32(value)
    <<w1::16, w0::16>> = <<value::signed-integer-little-32>>
    [w0, w1]
  end

  # WU32
  def w_u32bed(value) do
    value = to_uint32(value)
    <<w0::16, w1::16>> = <<value::unsigned-integer-big-32>>
    [w0, w1]
  end

  def w_u32led(value) do
    value = to_uint32(value)
    <<w0::16, w1::16>> = <<value::unsigned-integer-little-32>>
    [w0, w1]
  end

  def w_u32ber(value) do
    value = to_uint32(value)
    <<w1::16, w0::16>> = <<value::unsigned-integer-big-32>>
    [w0, w1]
  end

  def w_u32ler(value) do
    value = to_uint32(value)
    <<w1::16, w0::16>> = <<value::unsigned-integer-little-32>>
    [w0, w1]
  end
end
