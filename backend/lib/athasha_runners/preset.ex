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
            |> String.replace("\\*", ".*")
            |> String.replace("\\?", ".")

          pattern = "^#{pattern}$"
          IO.inspect({name, pattern})
          regex = Regex.compile!(pattern)
          match = fn txt -> String.match?(txt, regex) end
          tag = %{name: name, desc: desc, program: program, pattern: pattern, match: match}
          Map.put(map, name, tag)
        end
      )

    tag = %{
      id: "#{id} #{name} Tag",
      name: "#{name} Tag"
    }

    program = %{
      id: "#{id} #{name} Program",
      name: "#{name} Program"
    }

    pattern = %{
      id: "#{id} #{name} Pattern",
      name: "#{name} Pattern"
    }

    regex = %{
      id: "#{id} #{name} Regex",
      name: "#{name} Regex"
    }

    config = %{
      item: Item.head(item),
      name: name,
      tag: tag,
      regex: regex,
      program: program,
      pattern: pattern,
      params: params,
      programs: programs,
      tags: tags
    }

    PubSub.Input.register!(id, tag.id, tag.name, "")
    PubSub.Input.register!(id, program.id, program.name, "")
    PubSub.Input.register!(id, pattern.id, pattern.name, "")
    PubSub.Input.register!(id, regex.id, regex.name, "")
    PubSub.Output.register!(id, tag.id, tag.name)
    PubSub.Output.register!(id, program.id, program.name)

    Bus.register!({:write, tag.id})
    Bus.register!({:write, program.id})
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
          id == config.program.id ->
            run_program(config, name)

          id == config.tag.id ->
            run_tag(config, name)
        end

      other ->
        Raise.error({:receive, other})
    end
  end

  defp update_regex(config, value) do
    id = config.item.id
    regex = config.regex
    PubSub.Input.update!(id, regex.id, regex.name, value)
  end

  defp update_pattern(config, value) do
    id = config.item.id
    pattern = config.pattern
    PubSub.Input.update!(id, pattern.id, pattern.name, value)
  end

  defp update_program(config, value) do
    id = config.item.id
    program = config.program
    PubSub.Input.update!(id, program.id, program.name, value)
  end

  defp update_tag(config, value) do
    id = config.item.id
    tag = config.tag
    PubSub.Input.update!(id, tag.id, tag.name, value)
  end

  defp run_program(config, name, clear \\ true) do
    program = Map.get(config.programs, name)

    if program != nil do
      update_program(config, name)

      if clear do
        update_tag(config, "")
        update_regex(config, "")
        update_pattern(config, "")
      end

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
      update_tag(config, name)
      update_regex(config, tag.pattern)
      update_pattern(config, tag.name)
      run_program(config, tag.program, false)
    end
  end
end
