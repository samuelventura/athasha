defmodule Athasha.Spec do
  def for(module) do
    %{
      id: module,
      start: {module, :start_link, []},
      type: :worker,
      restart: :permanent,
      shutdown: 500
    }
  end
end
