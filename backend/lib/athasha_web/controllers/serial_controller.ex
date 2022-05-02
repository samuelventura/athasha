defmodule AthashaWeb.SerialController do
  use AthashaWeb, :controller

  def index(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end
end
