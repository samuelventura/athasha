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
    run_loop(id, item, points, :success)
  end

  defp run_loop(id, item, points, status) do
    status =
      receive do
        {{:point, point}, nil, value} ->
          Store.update!({:screen, id, point}, fn _ -> value end)
          Bus.dispatch!({:screen, id}, {point, value})
          status

        :poll ->
          nulls =
            Enum.reduce(points, 0, fn point, nulls ->
              value = Points.get_value(point)

              case value do
                nil ->
                  Store.update!({:screen, id, point}, fn _ -> value end)
                  Bus.dispatch!({:screen, id}, {point, value})
                  nulls + 1

                _ ->
                  nulls
              end
            end)

          status =
            cond do
              nulls > 0 ->
                if status == :success do
                  Items.update_status!(item, :error, "Missing Points")
                end

                :error

              true ->
                if status == :error do
                  Items.update_status!(item, :success, "Running")
                end

                :success
            end

          Process.send_after(self(), :poll, @poll)
          status

        other ->
          Process.exit(self(), {:receive, other})
          status
      end

    run_loop(id, item, points, status)
  end
end
