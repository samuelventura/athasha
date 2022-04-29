defmodule Athasha.Screen.Runner do
  alias Athasha.Bus
  alias Athasha.Items
  alias Athasha.Points

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
      Bus.dispatch!({:screen, id}, {point, value})
    end)

    Items.update_status!(item, :success, "Running")
    run_loop(id)
  end

  defp run_loop(id) do
    receive do
      {{:point, point}, nil, value} ->
        Bus.dispatch!({:screen, id}, {point, value})

      other ->
        Process.exit(self(), {:receive, other})
    end

    run_loop(id)
  end
end
