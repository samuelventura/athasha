defmodule Athasha.Runner.Preset do
  alias Athasha.Raise
  alias Athasha.PubSub
  alias Athasha.Number
  alias Athasha.Item
  alias Athasha.Bus
  @status 1000

  def run(item) do
    id = item.id
    config = item.config
    setts = config["setts"]
    name = setts["name"]

    {params, _} =
      Enum.reduce(
        config["params"],
        {[], %{}},
        fn param, {list, map} ->
          output = param["output"]

          case Map.has_key?(map, output) do
            true ->
              {list, map}

            false ->
              map = Map.put(map, output, true)
              list = [output | list]
              {list, map}
          end
        end
      )

    programs =
      Enum.reduce(
        config["programs"],
        %{},
        fn program, map ->
          name = program["name"]
          desc = program["desc"]

          values =
            Enum.reduce(
              program["params"],
              %{},
              fn param, map ->
                output = param["output"]
                value = Number.parse_float!(param["value"])
                Map.put(map, output, value)
              end
            )

          # check all outputs are present
          Enum.each(params, fn output ->
            Map.fetch!(values, output)
          end)

          program = %{name: name, desc: desc, values: values}
          Map.put(map, name, program)
        end
      )

    tags =
      Enum.reduce(
        config["tags"],
        %{},
        fn tag, map ->
          name = tag["name"]
          desc = tag["desc"]
          program = tag["program"]

          pattern =
            name
            |> Regex.escape()
            |> String.replace("*", ".*")
            |> String.replace("?", ".")

          regex = Regex.compile!("^#{pattern}$")
          match = fn txt -> String.match?(txt, regex) end
          tag = %{name: name, desc: desc, program: program, match: match}
          Map.put(map, name, tag)
        end
      )

    config = %{
      item: Item.head(item),
      name: name,
      tag: %{
        id: "#{id} #{name} Tag",
        name: "#{name} Tag"
      },
      program: %{
        id: "#{id} #{name} Program",
        name: "#{name} Program"
      },
      params: params,
      programs: programs,
      tags: tags
    }

    PubSub.Output.register!(id, config.tag.id, config.tag.name)
    PubSub.Output.register!(id, config.program.id, config.program.name)

    Bus.register!({:write, config.tag.id})
    Bus.register!({:write, config.program.id})
    PubSub.Status.update!(item, :success, "Running")
    Process.send_after(self(), :status, @status)
    run_loop(item, config)
  end

  defp run_loop(item, config) do
    wait_once(item, config)
    run_loop(item, config)
  end

  defp wait_once(item, config) do
    receive do
      :status ->
        PubSub.Status.update!(item, :success, "Running")
        Process.send_after(self(), :status, @status)

      {{:write, id}, _, value} ->
        name = "#{value}"

        cond do
          id == config.program.id -> run_program(config, name)
          id == config.tag.id -> run_tag(config, name)
        end

      other ->
        Raise.error({:receive, other})
    end
  end

  defp run_program(config, name) do
    program = Map.get(config.programs, name)

    if program != nil do
      Enum.each(config.params, fn output ->
        values = program.values
        value = Map.fetch!(values, output)
        Bus.dispatch!({:write, output}, value)
      end)
    end
  end

  defp run_tag(config, name) do
    tag =
      Enum.find(config.tags, fn {_, tag} ->
        tag.match.(name)
      end)

    if tag != nil do
      {_, tag} = tag
      run_program(config, tag.program)
    end
  end
end
