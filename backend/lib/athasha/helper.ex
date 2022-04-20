defmodule Athasha.Helper do
  # REPL debugging helpers

  # returns list of local named processes
  def processes(), do: Process.registered()

  # returns list of versioned items
  def items(), do: Athasha.Items.lookup(:items)

  # returns list of running item runners
  def runners(), do: Athasha.Items.lookup(:runner)

  # returns list of running item runners status
  def status(), do: Athasha.Items.lookup(:status)

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
