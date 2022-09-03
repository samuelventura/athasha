defmodule Terminal.State do
  def init() do
    {:ok, agent} = Agent.start_link(fn -> {[], %{}, %{}} end)
    agent
  end

  def push(agent, key) do
    :ok = Agent.update(agent, fn {keys, map1, map2} -> {[key | keys], map1, map2} end)
  end

  def pop(agent) do
    :ok = Agent.update(agent, fn {[_ | tail], map1, map2} -> {tail, map1, map2} end)
  end

  def reset(agent) do
    Agent.get_and_update(agent, fn {keys, map1, map2} -> {{keys, map1, map2}, {[], %{}, map1}} end)
  end

  def key(agent, key) do
    Agent.get(agent, fn {keys, _map1, _map2} -> [key | keys] end)
  end

  def use(agent, key, value) do
    Agent.get(agent, fn {_keys, map1, map2} ->
      if Map.has_key?(map1, key), do: raise("Duplicated key: #{key}")
      value = Map.get(map2, key, value)
      Map.put(map1, key, value)
      value
    end)
  end

  def put(agent, key, value) do
    :ok =
      Agent.update(agent, fn {keys, map1, map2} -> {keys, Map.put(map1, key, value), map2} end)
  end
end