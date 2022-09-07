defmodule Terminal.React do
  alias Terminal.State

  defmacro markup(key, modfun, props) do
    quote do
      {unquote(key), unquote(modfun), unquote(props), []}
    end
  end

  defmacro markup(key, modfun, props, do: inner) do
    inner = inner_to_list(inner)

    quote do
      {unquote(key), unquote(modfun), unquote(props), unquote(inner)}
    end
  end

  def use_state(react, key, initial) do
    key = State.key(react, key)
    current = State.use(react, key, initial)
    {current, fn value -> State.put(react, key, value) end}
  end

  defp inner_to_list(inner) do
    list =
      case inner do
        {_, _, list} -> list
      end

    list =
      for item <- list do
        quote do
          unquote(item)
        end
      end

    for {_, _, [key, _, _]} <- list, reduce: %{} do
      map ->
        if Map.has_key?(map, key), do: raise("Duplicated key: #{key}")
        Map.put(map, key, key)
    end

    list
  end
end
