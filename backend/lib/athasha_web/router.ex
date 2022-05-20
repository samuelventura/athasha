defmodule AthashaWeb.Router do
  use AthashaWeb, :router
  import Phoenix.LiveView.Router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_live_flash)
    plug(:put_root_layout, {AthashaWeb.LayoutView, :root})
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :api do
    plug(:accepts, ["json"])
  end

  if Mix.env() == :dev do
    scope "/phoenix", AthashaWeb do
      pipe_through(:browser)

      get("/", PageController, :index)
      live("/thermostat", ThermostatLive)
    end
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/demo" do
      pipe_through(:browser)

      live_dashboard("/dashboard", metrics: AthashaWeb.Telemetry)
    end
  end

  # Enables the Swoosh mailbox preview in development.
  #
  # Note that preview only shows emails that were sent by the same
  # node running the Phoenix server.
  if Mix.env() == :dev do
    scope "/dev" do
      pipe_through(:browser)

      forward("/mailbox", Plug.Swoosh.MailboxPreview)
    end
  end

  pipeline :client do
    plug(Plug.Static, at: "/", from: {:athasha, "priv/client"}, gzip: false)
  end

  scope "/api", AthashaWeb do
    pipe_through(:api)

    get("/info", ToolsController, :get_info)
    get("/check", ToolsController, :get_check)
    get("/update", ToolsController, :get_update)
    get("/serials", ToolsController, :get_serials)
    get("/licenses", ToolsController, :get_licenses)
    post("/licenses", ToolsController, :post_licenses)
    post("/testconnstr", ToolsController, :post_testconnstr)
    get("/point", ToolsController, :get_point)
  end

  scope "/", AthashaWeb do
    pipe_through(:client)

    get("/", ClientController, :index)
    # tail is the name of the param with the captured path
    get("/*tail", ClientController, :not_found)
  end
end
