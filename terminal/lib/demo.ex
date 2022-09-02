defmodule Terminal.Demo do
  @behaviour Terminal.App
  alias Terminal.Panel
  alias Terminal.Button
  alias Terminal.Label
  alias Terminal.React
  import Terminal.React

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    React.init(&counter/2, size: size)
  end

  defdelegate handle(state, event), to: React
  defdelegate render(state, canvas), to: React
  defdelegate execute(cmd), to: React

  def counter(react, %{size: size}) do
    {count, set_count} = use_state(react, 0)

    on_click = fn ->
      IO.inspect(count)
      set_count.(count + 1)
    end

    markup Panel, size: size do
      markup(Label, origin: {0, 0}, size: {12, 1}, text: "#{count}")

      markup(Button,
        origin: {0, 1},
        size: {12, 1},
        text: "Increment",
        on_click: on_click
      )
    end
  end
end
