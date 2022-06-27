import Config

config :athasha, Athasha.Repo,
  database: "/data/athasha.db",
  pool_size: 5

config :athasha,
  ecto_repos: [Athasha.Repo]

config :athasha, AthashaWeb.Endpoint,
  url: [host: "localhost", port: 80],
  check_origin: false,
  http: [
    ip: {0, 0, 0, 0},
    port: 80
  ],
  https: [
    port: 443,
    cipher_suite: :strong,
    keyfile: "priv/cert/selfsigned_key.pem",
    certfile: "priv/cert/selfsigned.pem"
  ],
  secret_key_base: "6FXmCjoJnMM6htNKvuQOwbUXqaNQYnFZFN4qqXYnwObXYTMo3WXR1/Eac/bnFOyi"

config :athasha, AthashaWeb.Endpoint, server: true

config :athasha, :root_path, "/data"
