import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.
# The block below contains prod specific runtime configuration.

# /data/dpi_apps/athasha.lib/lib/athasha/{ebin,priv}
# "/data/dpi_data/athasha"
root_path = System.get_env("DPI_DATA")

config :athasha,
  root_path: root_path

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
secret_key_base = "6FXmCjoJnMM6htNKvuQOwbUXqaNQYnFZFN4qqXYnwObXYTMo3WXR1/Eac/bnFOyi"

host = "localhost"
port = 54321
sport = 54320

config :athasha, AthashaWeb.Endpoint,
  server: true,
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
  https: [
    port: sport,
    cipher_suite: :strong,
    keyfile: "priv/cert/selfsigned_key.pem",
    certfile: "priv/cert/selfsigned.pem"
  ],
  secret_key_base: secret_key_base

config :phoenix, :json_library, Jason
