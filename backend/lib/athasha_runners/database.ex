defmodule Athasha.Database.Runner do
  use GenServer
  alias Athasha.Runner
  alias Athasha.Points

  def start_link(item, name) do
    GenServer.start_link(__MODULE__, item, name: name)
  end

  def stop(pid) do
    GenServer.stop(pid)
  end

  def terminate(_reason, state) do
    stop_dbconn(state)
  end

  def init(item) do
    id = item.id
    Runner.register_status(id, :warn, "Starting...")
    Process.flag(:trap_exit, true)
    config = Jason.decode!(item.config)

    host = config["host"]
    period = config["period"]
    {period, _} = Integer.parse(period)
    port = config["port"]
    {port, _} = Integer.parse(port)
    database = config["database"]
    username = config["username"]
    password = config["password"]
    command = config["command"]

    points =
      Enum.with_index(config["points"])
      |> Enum.map(fn {point, index} ->
        %{index: index, id: point["id"], param: "@#{index + 1}"}
      end)

    config = %{
      host: host,
      port: port,
      period: period,
      points: points,
      database: database,
      username: username,
      password: password,
      command: command
    }

    Process.send_after(self(), :run, 0)
    {:ok, %{item: item, config: config, dbconn: nil}}
  end

  def handle_info({:EXIT, pid, reason}, state = %{dbconn: dbconn}) do
    IO.inspect({:EXIT, pid, reason})

    state =
      case dbconn do
        ^pid -> stop_dbconn(state)
        _ -> state
      end

    {:noreply, state}
  end

  def handle_info(:run, state = %{item: item, config: config}) do
    try do
      state = connect(state)

      state =
        case run_once(state) do
          true ->
            state

          false ->
            stop_dbconn(state)
        end

      case state.dbconn do
        nil -> Process.send_after(self(), :run, 1000)
        _ -> Process.send_after(self(), :run, config.period)
      end

      {:noreply, state}
    rescue
      e ->
        IO.inspect({e, __STACKTRACE__})
        Runner.dispatch_status(item.id, :error, "#{inspect(e)}")
        Process.send_after(self(), :run, 1000)
        state = stop_dbconn(state)
        {:noreply, state}
    end
  end

  defp connect(state = %{item: item, config: config, dbconn: nil}) do
    Runner.dispatch_status(item.id, :warn, "Connecting...")

    case connect_dbconn(config) do
      {:ok, dbconn} ->
        Runner.dispatch_status(item.id, :success, "Connected")
        Map.put(state, :dbconn, dbconn)

      {:error, reason} ->
        Runner.dispatch_status(item.id, :error, "#{inspect(reason)}")
        state
    end
  end

  defp connect(state), do: state
  defp run_once(%{dbconn: nil}), do: false

  defp run_once(%{config: config, dbconn: dbconn}) do
    params =
      Enum.map(config.points, fn point ->
        value =
          case Points.one(point.id) do
            [{:read, _, {_, value}}] -> value
            _ -> nil
          end

        %Tds.Parameter{name: point.param, value: value}
      end)

    case Tds.query(dbconn, config.command, params) do
      {:ok, _res} ->
        true

      _ ->
        false
    end
  end

  defp connect_dbconn(config) do
    Tds.start_link(
      hostname: config.host,
      username: config.username,
      password: config.password,
      database: config.database,
      port: config.port
    )
  end

  defp stop_dbconn(state = %{dbconn: nil}), do: state

  defp stop_dbconn(state = %{dbconn: dbconn}) do
    Process.exit(dbconn, :stop)
    Map.put(state, :dbconn, nil)
  end
end
