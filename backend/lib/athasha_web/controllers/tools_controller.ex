defmodule AthashaWeb.ToolsController do
  use AthashaWeb, :controller
  alias Athasha.Ports
  alias Athasha.Tools
  alias Athasha.Server
  alias Athasha.Globals

  def get_serials(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end

  def get_info(conn, _params) do
    json(conn, Globals.info())
  end

  def get_check(conn, _params) do
    Server.check()
    text(conn, "ok")
  end

  def get_update(conn, _params) do
    Globals.update()
    text(conn, "ok")
  end

  def get_licenses(conn, _params) do
    json(conn, Tools.licenses())
  end

  # curl -X POST -H 'Content-Type: application/json' -d '{}'  http://localhost:4000/api/licenses
  # curl http://localhost:4000/api/licenses > /tmp/athasha.licenses
  # curl -X POST -H 'Content-Type: application/json' -d @/tmp/athasha.licenses  http://localhost:4000/api/licenses
  def post_licenses(conn, params) do
    # non maps are parsed into _json by json plug
    list = params["_json"]
    res = Tools.add_licenses(list)
    json(conn, res)
  end

  def post_testconnstr(conn, params) do
    port = Ports.open4("database", [params["database"]])
    true = Port.command(port, params["connstr"])

    res =
      receive do
        {^port, {:data, "ok"}} ->
          %{result: :ok}

        {^port, {:data, <<"ex:", msg::binary>>}} ->
          %{result: :er, error: msg}

        {^port, {:exit_status, status}} ->
          %{result: :er, error: "Unexpected port exit #{status}"}
      end

    true = Port.close(port)
    json(conn, res)
  end
end
