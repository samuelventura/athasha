defmodule Athasha.Runner.Screen do
  alias Athasha.Bus
  alias Athasha.Ports
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
    port = connect_port(dbpath)
    wait_ack(port, :connect)
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
              args = %{first: first, input: input}
              true = Port.command(port, ["s", Jason.encode!(args)])
              wait_ack(port, :select)

              receive do
                {^port, {:data, data}} ->
                  data = Jason.decode!(data)
                  data = Enum.zip(data["keys"], data["values"])
                  Enum.into(data, %{})

                {^port, {:exit_status, status}} ->
                  Raise.error({:receive, {:exit_status, status}})
              end

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

    run_once(id, inputs, port)
    Bus.register!({:screen, :init, id})
    PubSub.Status.update!(item, :success, "Running")
    PubSub.Password.register!(item, password)
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, period)
    run_loop(id, item, inputs, period, port)
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

  defp run_loop(id, item, inputs, period, port) do
    inputs = wait_once(id, item, inputs, period, port)
    run_loop(id, item, inputs, period, port)
  end

  defp wait_once(id, item, inputs, period, port) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)
        inputs

      :once ->
        inputs = run_once(id, inputs, port)
        Process.send_after(self(), :once, period)
        inputs

      {{:screen, :init, ^id}, nil, from} ->
        inputs = Enum.into(inputs, %{})
        status = PubSub.Status.get_one(id)
        init = %{item: item, status: status, inputs: inputs}
        send(from, {:screen, :init, init})
        inputs

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(id, inputs, port) do
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
            first = dt - config.length
            args = %{dt: dt, first: first, input: input, value: value}
            true = Port.command(port, ["i", Jason.encode!(args)])
            wait_ack(port, :select)
            values = Map.filter(config.values, fn {dt, _} -> dt > first end)
            values = Map.put(values, dt, value)
            next = dt + config.period
            Map.merge(config, %{next: next, values: values, value: value})

          _ ->
            Map.put(config, :value, value)
        end

      {input, config}
    end)
  end

  defp connect_port(dbpath) do
    args = [dbpath]
    Ports.open4("screen", args)
  end

  defp millis(dt), do: DateTime.to_unix(dt, :millisecond)
  defp db_path(id), do: Environ.file_path("screen_#{id}.db3")
end
