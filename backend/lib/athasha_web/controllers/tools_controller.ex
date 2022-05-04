defmodule AthashaWeb.ToolsController do
  use AthashaWeb, :controller
  alias Athasha.Tools

  def serial(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end

  def identity(conn, _params) do
    json(conn, Tools.identity())
  end

  def licenses(conn, _params) do
    json(conn, Tools.licenses())
  end

  def ips(conn, _params) do
    json(conn, Tools.ips())
  end
end
