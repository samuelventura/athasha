import Config

# athasha customization
config :phoenix, :json_library, Jason

config :athasha, Athasha.Repo,
  database: "/data/athasha.db",
  pool_size: 5

config :athasha,
  ecto_repos: [Athasha.Repo]

config :athasha, AthashaWeb.Endpoint,
  url: [host: "localhost", port: 54321],
  check_origin: false,
  http: [
    ip: {0, 0, 0, 0},
    port: 54321
  ],
  secret_key_base: "6FXmCjoJnMM6htNKvuQOwbUXqaNQYnFZFN4qqXYnwObXYTMo3WXR1/Eac/bnFOyi"

config :athasha, AthashaWeb.Endpoint, server: true
