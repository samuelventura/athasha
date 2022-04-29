defmodule AthashaWeb.SerialController do
  use AthashaWeb, :controller

  def index(conn, _params) do
    json(conn, Baud.Enum.list())
  end
end
