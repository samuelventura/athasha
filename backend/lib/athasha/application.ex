defmodule Athasha.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    config()

    children = [
      Athasha.Bus,
      # Start the Ecto repository
      Athasha.Repo,
      Athasha.Store,
      Athasha.Slave,
      Athasha.Server,
      Athasha.Runner,
      Athasha.Globals,
      # Start the Telemetry supervisor
      AthashaWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Athasha.PubSub},
      # Start the Endpoint (http/https)
      AthashaWeb.Endpoint
      # Start a worker by calling: Athasha.Worker.start_link(arg)
      # {Athasha.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    # :one_for_one is not reliable
    # killing store or runner will take down the application
    # :one_for_all solves that problem
    opts = [strategy: :one_for_all, name: Athasha.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    AthashaWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  def rt?(), do: System.get_env("DPI_RT") == "true"
  def path(), do: System.get_env("DPI_PATH")
  def data(), do: System.get_env("DPI_DATA")

  def config(), do: config(rt?(), :athasha)

  def config(false, _), do: nil

  def config(true, app_name) do
    exsp = Path.join([path(), "lib", "#{app_name}.exs"])
    envp = Path.join([path(), "lib", "#{app_name}.env"])
    content = File.read!(exsp)
    eval = Config.Reader.eval!(exsp, content)
    env = File.read!(envp) |> :erlang.binary_to_term()
    config = Config.Reader.merge(env, eval)
    :ok = Application.put_all_env(config)
    Athasha.Release.migrate()
  end
end
