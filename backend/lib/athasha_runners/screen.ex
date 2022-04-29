defmodule Athasha.Screen.Runner do
  alias Athasha.Bus
  alias Athasha.Raise
  alias Athasha.Items
  alias Athasha.Store
  alias Athasha.Points

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

    nulls =
      Enum.reduce(points, 0, fn point, nulls ->
        value = Points.get_value(point)
        Store.register!({:screen, id, point}, value)
        Bus.dispatch!({:screen, id}, {point, value})

        case value do
          nil -> nulls + 1
          _ -> nulls
        end
      end)

    update_status(item, nulls)
    run_loop(id, item, points, period)
  end

  # minimum period of 100ms makes it ok to notify status on each cycle
  defp run_loop(id, item, points, period) do
    nulls = run_once(id, points)
    update_status(item, nulls)
    Raise.on_message()
    :timer.sleep(period)
    run_loop(id, item, points, period)
  end

  defp run_once(id, points) do
    Enum.reduce(points, 0, fn point, nulls ->
      value = Points.get_value(point)
      Store.update!({:screen, id, point}, fn _ -> value end)
      Bus.dispatch!({:screen, id}, {point, value})

      case value do
        nil -> nulls + 1
        _ -> nulls
      end
    end)
  end

  defp update_status(item, nulls) do
    cond do
      nulls > 0 ->
        Items.update_status!(item, :error, "Missing Points")

      true ->
        Items.update_status!(item, :success, "Running")
    end
  end
end
