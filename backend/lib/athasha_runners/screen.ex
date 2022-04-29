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

    Items.update_status!(item, :success, "Connected")
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
        Items.update_status!(item, :success, "Running")
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
      value = Points.get_value(point)
      Store.update!({:screen, id, point}, fn _ -> value end)
      Bus.dispatch!({:screen, id}, {point, value})

      if value == nil do
        Raise.error({:missing, point})
      end
    end)
  end
end
