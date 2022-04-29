defmodule Athasha.Screen.Runner do
  alias Athasha.Bus
  alias Athasha.Items
  alias Athasha.Store
  alias Athasha.Points
  @poll 2000

  def run(item) do
    id = item.id
    config = Jason.decode!(item.config)
    setts = config["setts"]
    password = setts["password"]
    points = config["points"]
    Items.register_password!(item, password)

    Enum.each(points, fn point ->
      Bus.register!({:point, point}, nil)
      value = Points.get_value(point)
      Store.register!({:screen, id, point}, value)
      Bus.dispatch!({:screen, id}, {point, value})
    end)

    Items.update_status!(item, :success, "Running")
    Process.send_after(self(), :poll, @poll)
    run_loop(id, points)
  end

  defp run_loop(id, points) do
    receive do
      {{:point, point}, nil, value} ->
        Store.update!({:screen, id, point}, fn _ -> value end)
        Bus.dispatch!({:screen, id}, {point, value})

      :poll ->
        Enum.each(points, fn point ->
          value = Points.get_value(point)

          if value == nil do
            Store.update!({:screen, id, point}, fn _ -> value end)
            Bus.dispatch!({:screen, id}, {point, value})
          end
        end)

        Process.send_after(self(), :poll, @poll)

      other ->
        Process.exit(self(), {:receive, other})
    end

    run_loop(id, points)
  end
end
