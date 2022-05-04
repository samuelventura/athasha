defmodule AthashaWeb.ToolsController do
  use AthashaWeb, :controller

  def serial(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end

  def identity(conn, _params) do
    text(conn, Athasha.Auth.identity())
  end

  def licenses(conn, _params) do
    text(conn, Athasha.Auth.licenses())
  end
end
