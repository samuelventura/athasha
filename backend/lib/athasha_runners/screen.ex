defmodule Athasha.Runner.Screen do
  alias Athasha.Raise
  alias Athasha.PubSub
  @status 1000

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    password = setts["password"]
    inputs = config["inputs"]
    period = String.to_integer(setts["period"])

    # reset inputs on each reconnection attempt
    # check for duplicates before register
    Enum.reduce(inputs, %{}, fn input, map ->
      if !Map.has_key?(map, input) do
        PubSub.Screen.register!(id, input)
      end

      Map.put(map, input, input)
    end)

    PubSub.Password.register!(item, password)
    PubSub.Status.update!(item, :success, "Connected")
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, 0)
    run_loop(id, item, inputs, period)
  end

  defp run_loop(id, item, inputs, period) do
    wait_once(id, item, inputs, period)
    run_loop(id, item, inputs, period)
  end

  defp wait_once(id, item, inputs, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(id, inputs)
        Process.send_after(self(), :once, period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(id, inputs) do
    Enum.each(inputs, fn input ->
      value = PubSub.Input.get_value(input)
      PubSub.Screen.update!(id, input, value)

      if value == nil do
        Raise.error({:missing, input})
      end
    end)
  end
end
