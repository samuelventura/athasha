defmodule AthashaWeb.ToolsController do
  use AthashaWeb, :controller
  alias Athasha.Tools
  alias Athasha.Licenses

  def get_ips(conn, _params) do
    json(conn, Tools.ips())
  end

  def get_serials(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end

  def get_identity(conn, _params) do
    json(conn, Tools.identity())
  end

  def get_licenses(conn, _params) do
    json(conn, Tools.licenses())
  end

  # curl -X POST -H 'Content-Type: application/json' -d '{}'  http://localhost:4000/api/licenses
  # curl http://localhost:4000/api/licenses > /tmp/athasha.licenses
  # curl -X POST -H 'Content-Type: application/json' -d @/tmp/athasha.licenses  http://localhost:4000/api/licenses
  def post_licenses(conn, params) do
    list = params["_json"]
    res = Tools.add_licenses(list)
    Licenses.update()
    json(conn, res)
  end
end
