defmodule AthashaWeb.ClientController do
  use AthashaWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_header("content-type", "text/html; charset=utf-8")
    |> Plug.Conn.send_file(200, Path.join(client_path(), "index.html"))
  end

  def not_found(conn, _params) do
    send_resp(conn, 404, "")
  end

  def client_path() do
    Path.join(:code.priv_dir(:athasha), "client")
  end
end
