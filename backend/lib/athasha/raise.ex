defmodule Athasha.Raise do
  def error(error) do
    raise "#{inspect(error)}"
  end

  def on_message() do
    receive do
      msg -> error({:receive, msg})
    after
      0 -> nil
    end
  end
end
