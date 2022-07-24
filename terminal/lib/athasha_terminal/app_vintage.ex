defmodule AthashaTerminal.VintageApp do
  @behaviour AthashaTerminal.App
  def init(opts) do
    {w, h} = Keyword.fetch!(opts, :size)
    {0, w, h}
  end

  def update({p, w, h}, event) do
    case event do
      {:key, _, :arrow_left} ->
        cond do
          p <= 0 -> {0, w, h}
          true -> {p - 1, w, h}
        end

      {:key, _, :arrow_right} ->
        cond do
          p >= 10 -> {10, w, h}
          true -> {p + 1, w, h}
        end

      _ ->
        {p, w, h}
    end
  end

  def render({p, _w, _h}) do
    [
      {:window, p, p, 20, 3, :green}
    ]
  end
end
