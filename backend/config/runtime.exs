import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# Start the phoenix server if environment is set and running in a release
if System.get_env("PHX_SERVER") && System.get_env("RELEASE_NAME") do
  config :athasha, AthashaWeb.Endpoint, server: true
end

root_path = Application.app_dir(:athasha, "../../../") |> Path.expand()
# File.write!(Path.join(root_path, ".athasha.config"), "")

config :athasha,
  root_path: root_path

if config_env() == :prod do
  port_path = Path.join(root_path, "athasha.config.port")
  host_path = Path.join(root_path, "athasha.config.host")
  secret_path = Path.join(root_path, "athasha.config.secret")

  file_read = fn path, def ->
    case File.read(path) do
      {:ok, data} -> String.trim(data)
      _ -> def
    end
  end

  database_path = Path.join(root_path, "athasha.db")

  config :athasha, Athasha.Repo,
    database: database_path,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "5")

  # The secret key base is used to sign/encrypt cookies and other secrets.
  # A default value is used in config/dev.exs and config/test.exs but you
  # want to use a different value for prod and you most likely don't want
  # to check this value into version control, so we use an environment
  # variable instead.
  # MIX_ENV=prod mix phx.gen.secret
  secret_key_base =
    file_read.(secret_path, "6FXmCjoJnMM6htNKvuQOwbUXqaNQYnFZFN4qqXYnwObXYTMo3WXR1/Eac/bnFOyi")

  host = file_read.(host_path, "localhost")
  port = String.to_integer(file_read.(port_path, "54321"))

  config :athasha, AthashaWeb.Endpoint,
    url: [host: host, port: port],
    check_origin: false,
    http: [
      # Enable IPv6 and bind on all interfaces.
      # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
      # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
      # for details about using IPv6 vs IPv4 and loopback vs public addresses.
      ip: {0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # ## Using releases
  #
  # If you are doing OTP releases, you need to instruct Phoenix
  # to start each relevant endpoint:
  #
  config :athasha, AthashaWeb.Endpoint, server: true
  #
  # Then you can assemble a release by calling `mix release`.
  # See `mix help release` for more information.

  # ## Configuring the mailer
  #
  # In production you need to configure the mailer to use a different adapter.
  # Also, you may need to configure the Swoosh API client of your choice if you
  # are not using SMTP. Here is an example of the configuration:
  #
  #     config :athasha, Athasha.Mailer,
  #       adapter: Swoosh.Adapters.Mailgun,
  #       api_key: System.get_env("MAILGUN_API_KEY"),
  #       domain: System.get_env("MAILGUN_DOMAIN")
  #
  # For this example you need include a HTTP client required by Swoosh API client.
  # Swoosh supports Hackney and Finch out of the box:
  #
  #     config :swoosh, :api_client, Swoosh.ApiClient.Hackney
  #
  # See https://hexdocs.pm/swoosh/Swoosh.html#module-installation for details.
end
