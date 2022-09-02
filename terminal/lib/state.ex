defmodule Terminal.State do
  def init() do
    {:ok, agent} = Agent.start_link(fn -> %{:key => 0} end)
    agent
  end

  def reset(agent) do
    :ok = Agent.update(agent, fn state -> Map.put(state, :key, 0) end)
  end

  def next(agent) do
    Agent.get_and_update(agent, fn %{key: key} = state ->
      key = key + 1
      {key, Map.put(state, :key, key)}
    end)
  end

  def get(agent, key, value) do
    Agent.get(agent, fn state -> Map.get(state, key, value) end)
  end

  def put(agent, key, value) do
    :ok = Agent.update(agent, fn state -> Map.put(state, key, value) end)
  end
end
