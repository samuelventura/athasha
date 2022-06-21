defmodule AthashaFwTest do
  use ExUnit.Case
  doctest AthashaFw

  test "greets the world" do
    assert AthashaFw.hello() == :world
  end
end
