defmodule Athasha.Screen.Runner do
  alias Athasha.Bus
  alias Athasha.Raise
  alias Athasha.Items
  alias Athasha.Store
  alias Athasha.Points
  @status 1000

  def run(item) do
    id = item.id
    config = Jason.decode!(item.config)
    setts = config["setts"]
    password = setts["password"]
    points = config["points"]
    period = setts["period"]
    period = max(period, 100)
    {period, _} = Integer.parse(period)

    Items.register_password!(item, password)

    Enum.each(points, fn point ->
      value = Points.get_value(point)
      Store.register!({:screen, id, point}, value)
      Bus.dispatch!({:screen, id}, {point, value})

      if value == nil do
        Raise.error({:missing, point})
      end
    end)

    Process.send_after(self(), :status, @status)
    Items.update_status!(item, :success, "Connected")
    run_loop(id, item, points, period)
  end

  # minimum period of 100ms makes it ok to notify status on each cycle
  defp run_loop(id, item, points, period) do
    throttled_status(item)
    run_once(id, points)
    :timer.sleep(period)
    run_loop(id, item, points, period)
  end

  defp throttled_status(item) do
    receive do
      :status ->
        Items.update_status!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      other ->
        Raise.error({:receive, other})
    after
      0 -> nil
    end
  end

  defp run_once(id, points) do
    Enum.each(points, fn point ->
      value = Points.get_value(point)
      Store.update!({:screen, id, point}, fn _ -> value end)
      Bus.dispatch!({:screen, id}, {point, value})

      if value == nil do
        Raise.error({:missing, point})
      end
    end)
  end
end
