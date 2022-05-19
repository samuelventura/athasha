defmodule Athasha.Runner.Database do
  alias Athasha.Raise
  alias Athasha.Ports
  alias Athasha.Store
  alias Athasha.Points
  @status 1000

  def run(item) do
    config = item.config
    setts = config["setts"]
    unit = setts["unit"]
    period = String.to_integer(setts["period"])
    database = setts["database"]
    connstr = setts["connstr"]
    command = setts["command"]
    dbpass = setts["dbpass"]
    connstr = String.replace(connstr, "${PASSWORD}", dbpass)

    period =
      case unit do
        "s" -> period * 1000
        "m" -> period * 1000 * 60
      end

    points =
      Enum.with_index(config["points"])
      |> Enum.map(fn {point, index} ->
        %{index: index, id: point["id"], param: "@#{index + 1}"}
      end)

    config = %{
      item: Map.take(item, [:id, :name, :type]),
      period: period,
      points: points,
      database: database,
      connstr: connstr,
      command: command
    }

    Store.Status.update!(item, :warn, "Connecting...")
    port = connect_port(config)
    true = Port.command(port, config.connstr)
    wait_ack(port, :connect)
    Store.Status.update!(item, :success, "Connected")
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, 0)
    run_loop(item, config, port)
  end

  defp wait_ack(port, action) do
    receive do
      {^port, {:data, "ok"}} ->
        :ok

      {^port, {:data, <<"ex:", msg::binary>>}} ->
        Raise.error({action, msg})

      {^port, {:exit_status, status}} ->
        Raise.error({:receive, {:exit_status, status}})
    end
  end

  defp run_loop(item, config, port) do
    wait_once(item, config, port)
    run_loop(item, config, port)
  end

  defp wait_once(item, config, port) do
    receive do
      :status ->
        Store.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, port)
        Process.send_after(self(), :once, config.period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(_item, config, port) do
    parameters =
      Enum.map(config.points, fn point ->
        id = point.id
        value = Points.get_value(id)

        if value == nil do
          Raise.error({:missing, id})
        end

        %{value: value, type: type_of(value)}
      end)

    dto = %{command: config.command, parameters: parameters}
    true = Port.command(port, ["b", Jason.encode!(dto)])
    wait_ack(port, :insert)
  end

  defp connect_port(config) do
    args = [config.database]
    Ports.open4("database", args)
  end

  defp type_of(value) when is_float(value), do: "float"
  defp type_of(value) when is_integer(value), do: "integer"
  defp type_of(value) when is_struct(value, Decimal), do: "decimal"
end
