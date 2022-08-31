defmodule AthashaFirmware.VintageConst do
  defmacro __using__(_) do
    quote do
      @disabled "Disabled"
      @dhcp "DHCP"
      @static "Static"
    end
  end
end
