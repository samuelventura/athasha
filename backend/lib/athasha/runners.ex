defmodule Athasha.Runners do
  def start_link() do
    Supervisor.start_link([], name: __MODULE__, strategy: :one_for_one)
  end

  # each runner gets its own supervisor to avoid
  # exceeding the default restart intensity
  def add(child_spec) do
    Supervisor.start_child(__MODULE__, spec(child_spec))
  end

  def remove(child_id) do
    case Supervisor.terminate_child(__MODULE__, child_id) do
      :ok ->
        Supervisor.delete_child(__MODULE__, child_id)

      any ->
        any
    end
  end

  def start_runner(child_spec) do
    Supervisor.start_link([child_spec], strategy: :one_for_one)
  end

  defp spec(child_spec) do
    %{
      id: child_spec.id,
      start: {__MODULE__, :start_runner, [child_spec]},
      type: :supervisor
    }
  end
end
