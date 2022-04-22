defmodule Athasha.Runners do
  def start_link() do
    Supervisor.start_link([], name: __MODULE__, strategy: :one_for_one)
  end

  def add(child_spec) do
    Supervisor.start_child(__MODULE__, child_spec)
  end

  def remove(child_id) do
    case Supervisor.terminate_child(__MODULE__, child_id) do
      :ok ->
        Supervisor.delete_child(__MODULE__, child_id)

      any ->
        any
    end
  end
end
