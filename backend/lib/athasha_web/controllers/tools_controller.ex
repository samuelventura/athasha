defmodule AthashaWeb.ToolsController do
  use AthashaWeb, :controller
  alias Athasha.Number
  alias Athasha.Server
  alias Athasha.Globals
  alias Athasha.PubSub
  alias Athasha.Tools
  alias Athasha.Bus

  def get_serials(conn, _params) do
    json(conn, Modbus.Serial.Enum.list())
  end

  def get_info(conn, _params) do
    json(conn, Globals.find_all())
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
    json(conn, Tools.load_licenses())
  end

  def post_licenses(conn, params) do
    # non maps are parsed into _json by json plug
    list = params["_json"]

    list =
      Enum.map(list, fn lic ->
        %{
          identity: lic["identity"],
          purchase: lic["purchase"],
          signature: lic["signature"],
          quantity: lic["quantity"]
        }
      end)

    json(conn, Tools.insert_licenses(list))
  end

  def post_testconnstr(conn, params) do
    params = %{
      database: params["database"],
      connstr: params["connstr"]
    }

    json(conn, Tools.test_connstr(params))
  end

  def get_input(conn, params) do
    point = params["id"] |> Base.decode64!()
    [id, _name] = String.split(point, " ", parts: 2)
    {password, hash} = PubSub.Password.get_pair(id)

    case get_req_header(conn, "access-password") do
      [] ->
        case password == "" do
          true -> text(conn, PubSub.Input.get_value(point))
          false -> resp(conn, 404, "Not found")
        end

      [^hash] ->
        text(conn, PubSub.Input.get_value(point))

      _ ->
        resp(conn, 404, "Not found")
    end
  end

  def get_output(conn, params) do
    point = params["id"] |> Base.decode64!()
    [id, _name] = String.split(point, " ", parts: 2)
    {password, hash} = PubSub.Password.get_pair(id)

    case get_req_header(conn, "access-password") do
      [] ->
        case password == "" do
          true -> text(conn, PubSub.Output.get_value(point))
          false -> resp(conn, 404, "Not found")
        end

      [^hash] ->
        text(conn, PubSub.Output.get_value(point))

      _ ->
        resp(conn, 404, "Not found")
    end
  end

  def post_output(conn, params) do
    point = params["id"] |> Base.decode64!()
    [id, _name] = String.split(point, " ", parts: 2)
    {password, hash} = PubSub.Password.get_pair(id)
    {:ok, value, conn} = read_body(conn)
    value = Number.to_number!(value)

    case get_req_header(conn, "access-password") do
      [] ->
        case password == "" do
          true ->
            Bus.dispatch!({:write, point}, value)
            text(conn, "ok")

          false ->
            resp(conn, 404, "Not found")
        end

      [^hash] ->
        Bus.dispatch!({:write, point}, value)
        text(conn, "ok")

      _ ->
        resp(conn, 404, "Not found")
    end
  end
end
