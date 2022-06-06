defmodule Athasha.Runner.Screen do
  alias Athasha.Bus
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Environ
  @status 1000

  def clean(item) do
    File.rm(db_path(item.id))
  end

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
      :ok =
        Exqlite.Sqlite3.execute(
          conn,
          "create table trend (dt INTEGER, input TEXT, value REAL)"
        )

      :ok = Exqlite.Sqlite3.execute(conn, "create index trend_dt on trend (dt)")
      :ok = Exqlite.Sqlite3.execute(conn, "create index trend_input on trend (input)")
    end

    {:ok, setter} =
      Exqlite.Sqlite3.prepare(conn, "insert into trend (dt, input, value) values (?1, ?2, ?3)")

    {:ok, cleaner} =
      Exqlite.Sqlite3.prepare(
        conn,
        "delete from trend where input = ?1 and dt < ?2"
      )

    {:ok, getter} = Exqlite.Sqlite3.prepare(conn, "select dt, value from trend where input = ?1")

    now = DateTime.utc_now()

    inputs =
      Enum.map(inputs, fn {input, trend} ->
        PubSub.Screen.register!(id, input)
        enabled = trend["enabled"]
        period = trend["period"]
        length = trend["length"]

        values =
          case enabled do
            true ->
              first = DateTime.add(now, -length, :second) |> DateTime.to_unix(:millisecond)
              :ok = Exqlite.Sqlite3.bind(conn, cleaner, [input, first])
              :done = Exqlite.Sqlite3.step(conn, cleaner)
              :ok = Exqlite.Sqlite3.bind(conn, getter, [input])
              read_all(conn, getter)

            false ->
              %{}
          end

        trend = %{
          next: DateTime.utc_now() |> DateTime.to_unix(:millisecond),
          enabled: enabled,
          period: 1000 * period,
          length: 1000 * length,
          values: values
        }

        {input, trend}
      end)

    db = %{conn: conn, setter: setter, cleaner: cleaner}

    run_once(id, inputs, db)
    Bus.register!({:screen, :trend, id})
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

      {{:screen, :trend, ^id}, nil, from} ->
        data = Enum.into(inputs, %{})
        PubSub.Screen.response!(from, data)
        inputs

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(id, inputs, db) do
    Enum.map(inputs, fn {input, trend} ->
      value = PubSub.Input.get_value(input)
      PubSub.Screen.update!(id, input, value)

      if value == nil do
        Raise.error({:missing, input})
      end

      dt = DateTime.utc_now() |> DateTime.to_unix(:millisecond)

      trend =
        case trend.enabled && dt > trend.next do
          true ->
            :ok = Exqlite.Sqlite3.bind(db.conn, db.setter, [dt, input, value])
            :done = Exqlite.Sqlite3.step(db.conn, db.setter)
            last = dt - trend.length
            :ok = Exqlite.Sqlite3.bind(db.conn, db.cleaner, [input, last])
            :done = Exqlite.Sqlite3.step(db.conn, db.cleaner)
            values = Map.filter(trend.values, fn {dt, _} -> dt > last end)
            values = Map.put(values, dt, value)
            next = dt + trend.period
            Map.merge(trend, %{next: next, values: values})

          _ ->
            trend
        end

      {input, trend}
    end)
  end

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
