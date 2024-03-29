defmodule Modbus.FloatTest do
  use ExUnit.Case
  alias Athasha.Number

  test "number conversion test" do
    assert 65535 == Number.to_uint16(65535)
    assert 65535 == Number.to_uint16(65535 + 1)
    assert 0 == Number.to_uint16(0)
    assert 0 == Number.to_uint16(0 - 1)

    assert 65535 == Number.to_uint16(65535.0)
    assert 65535 == Number.to_uint16(65535.0 + 1.0)
    assert 0 == Number.to_uint16(0.0)
    assert 0 == Number.to_uint16(0.0 - 1.0)

    assert 32767 == Number.to_sint16(32767)
    assert 32767 == Number.to_sint16(32767 + 1)
    assert -32768 == Number.to_sint16(-32768)
    assert -32768 == Number.to_sint16(-32768 - 1)

    assert 32767 == Number.to_sint16(32767.0)
    assert 32767 == Number.to_sint16(32767.0 + 1.0)
    assert -32768 == Number.to_sint16(-32768.0)
    assert -32768 == Number.to_sint16(-32768.0 - 1.0)

    assert 0 == Number.to_bit(-0.0)

    assert 0 == Number.w_u16be(0)
    assert 0 == Number.w_u16be(0 - 1)
    assert 65535 == Number.w_u16be(65535)
    assert 65535 == Number.w_u16be(65535 + 1)
  end
end
