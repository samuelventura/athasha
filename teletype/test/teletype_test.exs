defmodule TeletypeTest do
  use ExUnit.Case
  doctest Teletype

  test "greets the world" do
    assert Teletype.hello() == :world
  end
end
