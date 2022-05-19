defmodule Athasha.PubSub.Logout do
  alias Athasha.Bus

  @key :logout

  def dispatch!() do
    Bus.dispatch!(@key, nil)
  end
end
