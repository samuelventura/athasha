defmodule ComfileTest do
  use ExUnit.Case
  doctest Comfile

  test "greets the world" do
    assert Comfile.hello() == :world
  end
end
