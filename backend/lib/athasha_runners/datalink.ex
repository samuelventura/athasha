defmodule Athasha.Runner.Datalink do
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Item
  alias Athasha.Bus
  @status 1000

  def run(item) do
    config = item.config
    setts = config["setts"]
    period = String.to_integer(setts["period"])

    links =
      Enum.with_index(config["links"])
      |> Enum.map(fn {link, index} ->
        input = link["input"]
        output = link["output"]
        factor = Number.parse_float!(link["factor"])
        offset = Number.parse_float!(link["offset"])
        calib = Number.calibrator(factor, offset)
        %{index: index, input: input, output: output, calib: calib}
      end)

    config = %{
      item: Item.head(item),
      period: period,
      links: links
    }

    run_once(item, config, links)
    PubSub.Status.update!(item, :success, "Running")
    Process.send_after(self(), :status, @status)
    Process.send_after(self(), :once, period)
    run_loop(item, config, links, period)
  end

  defp run_loop(item, config, links, period) do
    wait_once(item, config, links, period)
    run_loop(item, config, links, period)
  end

  defp wait_once(item, config, links, period) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      :once ->
        run_once(item, config, links)
        Process.send_after(self(), :once, period)

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_once(_item, _config, links) do
    Enum.each(links, fn link ->
      output = link.output
      input = link.input
      value = PubSub.Input.get_value(input)

      if value == nil do
        Raise.error({:missing, input})
      end

      value = link.calib.(value)
      current = PubSub.Output.get_value(output)

      if value != current do
        Bus.dispatch!({:write, output}, value)
      end
    end)
  end
end
