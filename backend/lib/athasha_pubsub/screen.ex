defmodule Athasha.PubSub.Screen do
  alias Athasha.Store
  alias Athasha.Raise
  alias Athasha.Bus

  @key :screen

  def list(id) do
    match = {{@key, id, :"$1"}, :"$2", :"$3"}
    select = {{:"$1", :"$2", :"$3"}}
    query = [{match, [], [select]}]
    Store.select(query)
  end

  def register!(id, input) do
    Store.register!({@key, id, input})
    Bus.dispatch!({@key, id}, {input, nil})
  end

  def update!(id, input, value) do
    {new, old} = Store.update!({@key, id, input}, fn _ -> value end)

    if new != old do
      Bus.dispatch!({@key, id}, {input, value})
    end
  end

  def initial!(id) do
    Bus.dispatch!({@key, :initial, id}, self())

    receive do
      {:screen, :initial, initial} ->
        initial
    after
      2000 ->
        Raise.error({:timeout, :initial})
    end
  end
end
