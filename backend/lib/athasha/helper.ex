defmodule Athasha.Helper do
  # REPL debugging helpers

  # returns list of local named processes
  def processes(), do: Process.registered()

  # returns list of versioned items
  def items(), do: Athasha.Items.items()

  # returns list of points
  def points(), do: Athasha.Points.all()

  # returns list of running item runners
  def runners(), do: Athasha.Items.runners()

  # returns list of running item runners status
  def status(), do: Athasha.Items.status()

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
