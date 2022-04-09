defmodule AthashaWeb.PageController do
  use AthashaWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
