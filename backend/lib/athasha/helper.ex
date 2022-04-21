defmodule Athasha.Helper do
  # REPL debugging helpers

  # returns list of local named processes
  def processes(), do: Process.registered()

  # prints received messages
  def messages(), do: _messages()

  defp _messages(list \\ []) do
    receive do
      msg ->
        _messages([msg | list])
    after
      0 -> list
    end
  end
end
