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
    {period, _} = Integer.parse(period)
    Items.register_password!(item, password)

    {points, nulls} =
      Enum.reduce(points, {%{}, 0}, fn point, {points, nulls} ->
        value = Points.get_value(point)
        Store.register!({:screen, id, point}, value)
        Bus.dispatch!({:screen, id}, {point, value})
        points = Map.put(points, point, value)

        case value do
          nil -> {points, nulls + 1}
          _ -> {points, nulls}
        end
      end)

    status = update_status(item, nulls, :first)
    run_loop(id, item, points, status, period)
  end

  defp run_loop(id, item, points, status, period) do
    {points, status} = run_once(id, item, points, status)
    Raise.on_message()
    :timer.sleep(period)
    run_loop(id, item, points, status, period)
  end

  defp run_once(id, item, points, status) do
    {points, nulls} =
      Enum.reduce(points, {%{}, 0}, fn {point, current}, {points, nulls} ->
        value = Points.get_value(point)
        points = Map.put(points, point, value)

        if value != current do
          Store.update!({:screen, id, point}, fn _ -> value end)
          Bus.dispatch!({:screen, id}, {point, value})
        end

        case value do
          nil -> {points, nulls + 1}
          _ -> {points, nulls}
        end
      end)

    status = update_status(item, nulls, status)
    {points, status}
  end

  defp update_status(item, nulls, :first) do
    cond do
      nulls > 0 ->
        Items.update_status!(item, :error, "Missing Points")
        :error

      true ->
        Items.update_status!(item, :success, "Running")
        :success
    end
  end

  defp update_status(item, nulls, :error) do
    cond do
      nulls > 0 ->
        :error

      true ->
        Items.update_status!(item, :success, "Running")
        :success
    end
  end

  defp update_status(item, nulls, :success) do
    cond do
      nulls > 0 ->
        Items.update_status!(item, :error, "Missing Points")
        :error

      true ->
        :success
    end
  end
end
