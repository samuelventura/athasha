defmodule Athasha.PubSub.Dataplot do
  alias Athasha.Bus

  @key :dataplot

  def response!(from, data) do
    Bus.dispatch!({@key, from}, data)
  end

  def request!(id, args) do
    Bus.dispatch!({@key, id}, {self(), args})
  end
end
