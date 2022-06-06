defmodule Athasha.Runner.Screen do
  alias Athasha.Bus
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Environ
  @status 1000

  def clean(item) do
    File.rm(db_path(item.id))
  end

  @sql_create "create table trend (dt INTEGER, input TEXT, value REAL)"
  @sql_index_dt "create index trend_dt on trend (dt)"
  @sql_index_input "create index trend_input on trend (input)"
  @sql_insert "insert into trend (dt, input, value) values (?1, ?2, ?3)"
  @sql_clean "delete from trend where input = ?1 and dt < ?2"
  @sql_select "select dt, value from trend where input = ?1"

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    password = setts["password"]
    inputs = config["inputs"]
    period = String.to_integer(setts["period"])

    dbpath = db_path(id)
    exists = File.exists?(dbpath)
    {:ok, conn} = Exqlite.Sqlite3.open(dbpath)

    if !exists do
      :ok = Exqlite.Sqlite3.execute(conn, @sql_create)
      :ok = Exqlite.Sqlite3.execute(conn, @sql_index_dt)
      :ok = Exqlite.Sqlite3.execute(conn, @sql_index_input)
    end

    {:ok, setter} = Exqlite.Sqlite3.prepare(conn, @sql_insert)
    {:ok, cleaner} = Exqlite.Sqlite3.prepare(conn, @sql_clean)
    {:ok, getter} = Exqlite.Sqlite3.prepare(conn, @sql_select)

    now = DateTime.utc_now()

    inputs =
      Enum.map(inputs, fn {input, config} ->
        PubSub.Screen.register!(id, input)
        trend = config["trend"]
        period = 1000 * config["period"]
        length = 1000 * config["length"]

        values =
          case trend do
            true ->
              first = DateTime.add(now, -length, :second) |> millis()
              :ok = Exqlite.Sqlite3.bind(conn, cleaner, [input, first])
              :done = Exqlite.Sqlite3.step(conn, cleaner)
              :ok = Exqlite.Sqlite3.bind(conn, getter, [input])
              read_all(conn, getter)

            false ->
              nil
          end

        config = %{
          next: DateTime.utc_now() |> millis(),
          period: period,
          length: length,
          values: values,
          trend: trend,
          value: nil
        }

        {input, config}
      end)

    db = %{conn: conn, setter: setter, cleaner: cleaner}

    run_once(id, inputs, db)
    Bus.register!({:screen, :initial, id})
    PubSub.Status.update!(item, :success, "Running")
    PubSub.Password.register!(item, password)
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, period)
    run_loop(id, item, inputs, period, db)
  end

  defp run_loop(id, item, inputs, period, db) do
    inputs = wait_once(id, item, inputs, period, db)
    run_loop(id, item, inputs, period, db)
  end

  defp wait_once(id, item, inputs, period, db) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        inputs

      :once ->
        inputs = run_once(id, inputs, db)
        Process.send_after(self(), :once, period)
        inputs

      {{:screen, :initial, ^id}, nil, from} ->
        initial = Enum.into(inputs, %{})
        send(from, {:screen, :initial, initial})
        inputs

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(id, inputs, db) do
    Enum.map(inputs, fn {input, config} ->
      value = PubSub.Input.get_value(input)
      PubSub.Screen.update!(id, input, value)

      if value == nil do
        Raise.error({:missing, input})
      end

      dt = DateTime.utc_now() |> millis()

      config =
        case config.trend && dt > config.next do
          true ->
            :ok = Exqlite.Sqlite3.bind(db.conn, db.setter, [dt, input, value])
            :done = Exqlite.Sqlite3.step(db.conn, db.setter)
            last = dt - config.length
            :ok = Exqlite.Sqlite3.bind(db.conn, db.cleaner, [input, last])
            :done = Exqlite.Sqlite3.step(db.conn, db.cleaner)
            values = Map.filter(config.values, fn {dt, _} -> dt > last end)
            values = Map.put(values, dt, values)
            next = dt + config.period
            Map.merge(config, %{next: next, values: values, value: value})

          _ ->
            Map.put(config, :value, value)
        end

      {input, config}
    end)
  end

  defp millis(dt), do: DateTime.to_unix(dt, :millisecond)
  defp db_path(id), do: Environ.file_path("screen_#{id}.db3")

  defp read_all(conn, getter, map \\ %{}) do
    case Exqlite.Sqlite3.step(conn, getter) do
      :done ->
        map

      {:row, [dt, value]} ->
        map = Map.put(map, dt, value)
        read_all(conn, getter, map)
    end
  end
end
