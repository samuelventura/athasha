defmodule Athasha.Runner.Screen do
  alias Athasha.Raise
  alias Athasha.PubSub
  @status 1000

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    password = setts["password"]
    points = config["points"]
    period = String.to_integer(setts["period"])

    PubSub.Password.register!(item, password)

    # reset points on each reconnection attempt
    # check for duplicates before register
    Enum.reduce(points, %{}, fn point, map ->
      if !Map.has_key?(map, point) do
        PubSub.Screen.register!(id, point)
      end

      Map.put(map, point, point)
    end)

    PubSub.Status.update!(item, :success, "Connected")
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, 0)
    run_loop(id, item, points, period)
  end

  defp run_loop(id, item, points, period) do
    wait_once(id, item, points, period)
    run_loop(id, item, points, period)
  end

  defp wait_once(id, item, points, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(id, points)
        Process.send_after(self(), :once, period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(id, points) do
    Enum.each(points, fn point ->
      value = PubSub.Input.get_value(point)
      PubSub.Screen.update!(id, point, value)

      if value == nil do
        Raise.error({:missing, point})
      end
    end)
  end
end
