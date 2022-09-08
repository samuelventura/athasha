defmodule AthashaFirmware.VintageApp do
  use Terminal.App
  alias Terminal.Panel
  alias Terminal.Button
  alias Terminal.Label
  alias Terminal.Select
  alias Terminal.Frame

  def init(opts) do
    size = Keyword.fetch!(opts, :size)
    nics = Keyword.fetch!(opts, :nics)
    app_init(&main/2, size: size, nics: nics)
  end

  def main(react, %{size: size, nics: nics}) do
    # {count, set_count} = use_state(react, :count, 0)

    # # increment = fn -> set_count.(count + 1) end
    # # decrement = fn -> set_count.(count - 1) end

    markup :panel, Panel, size: size do
      markup(:label, Label, origin: {0, 0}, text: "Network Settings")

      markup(:nics_frame, Frame,
        origin: {0, 1},
        size: {12, 10},
        text: "NICs"
      )

      markup(:nics_select, Select,
        origin: {1, 2},
        size: {10, 8},
        items: nics
      )
    end
  end
end
