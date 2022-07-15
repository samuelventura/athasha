defmodule AthashaTerminal.TTYConst do
  defmacro __using__(_opts) do
    list = load()

    const =
      quote bind_quoted: [list: list] do
        def const(), do: unquote(list)
      end

    list =
      for {name, value} <- list do
        quote bind_quoted: [name: name, value: value] do
          def unquote(name)(), do: unquote(value)
        end
      end

    [const | list]
  end

  def load() do
    file = Path.join(File.cwd!(), "src/termbox/src/termbox.h")

    for line <- File.stream!(file, [], :line),
        String.starts_with?(line, "#define TB_") do
      [_, name, value] = String.split(line, ~r{\s}, parts: 3, trim: true)

      value =
        case String.split(value, ~r{\s}, parts: 2, trim: true) do
          [value, _] -> value
          [value] -> value
        end

      {value, _} = Code.eval_string(value)

      name =
        name
        |> String.downcase()
        |> String.to_atom()

      {name, value}
    end
  end
end
