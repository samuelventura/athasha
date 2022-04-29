defmodule Athasha.Raise do
  def error(error) do
    raise "#{inspect(error)}"
  end
end
