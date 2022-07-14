defmodule AthashaTerminalTest do
  use ExUnit.Case
  doctest AthashaTerminal

  test "greets the world" do
    assert AthashaTerminal.hello() == :world
  end
end
