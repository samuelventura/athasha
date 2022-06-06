defmodule Athasha.PubSub.Screen do
  alias Athasha.Store
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

  @trend :trend

  def response!(from, inputs) do
    Bus.dispatch!({@key, @trend, from}, inputs)
  end

  def request!(id) do
    Bus.dispatch!({@key, @trend, id}, self())
  end
end
