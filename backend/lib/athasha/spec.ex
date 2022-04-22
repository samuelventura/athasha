defmodule Athasha.Spec do
  def forWorker(module) do
    %{
      id: module,
      start: {module, :start_link, []},
      type: :worker,
      restart: :permanent,
      shutdown: 500
    }
  end

  def forRunner(module, id, args) do
    %{
      id: id,
      start: {module, :start_link, args},
      type: :worker,
      restart: :permanent,
      shutdown: :brutal_kill
    }
  end

  def forSuper(module) do
    %{
      id: module,
      start: {module, :start_link, []},
      type: :supervisor
    }
  end
end
