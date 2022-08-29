defmodule AthashaFirmware do
  def target() do
    Application.get_env(:athasha_firmware, :target)
  end

  def exit() do
    # exit from nerves shell (works in host as well)
    Process.exit(Process.group_leader(), :kill)
  end
end
