```bash
samuel@DESKTOP-LAUUTNU MINGW64 /c/Users/samuel/Desktop/athasha
$ (cd backend && mix phx.gen.release)
* creating rel/overlays/bin/server
* creating rel/overlays/bin/server.bat
* creating rel/overlays/bin/migrate
* creating rel/overlays/bin/migrate.bat
* creating lib/athasha/release.ex

Your application is ready to be deployed in a release!

See https://hexdocs.pm/mix/Mix.Tasks.Release.html for more information about Elixir releases.

Here are some useful release commands you can run in any release environment:

    # To build a release
    mix release

    # To start your system with the Phoenix server running
    _build/dev/rel/athasha/bin/server

    # To run migrations
    _build/dev/rel/athasha/bin/migrate

Once the release is running you can connect to it remotely:

    _build/dev/rel/athasha/bin/athasha remote

To list all commands:

    _build/dev/rel/athasha/bin/athasha

[warn] Conditional IPV6 support missing from runtime configuration.

Add the following to your config/runtime.exs:

    maybe_ipv6 = if System.get_env("ECTO_IPV6"), do: [:inet6], else: []

    config :athasha, Athasha.Repo,
      ...,
      socket_options: maybe_ipv6

samuel@DESKTOP-LAUUTNU MINGW64 /c/Users/samuel/Desktop/athasha
$ (cd backend && MIX_ENV=prod mix release)
Compiling 1 file (.ex)
Generated athasha app
* assembling athasha-0.1.0 on MIX_ENV=prod
* using config/runtime.exs to configure the release at runtime

Release created at _build/prod/rel/athasha!

    # To start your system
    _build/prod/rel/athasha/bin/athasha start

Once the release is running:

    # To connect to it remotely
    _build/prod/rel/athasha/bin/athasha remote

    # To stop it gracefully (you may also send SIGINT/SIGTERM)
    _build/prod/rel/athasha/bin/athasha stop

To list all commands:

    _build/prod/rel/athasha/bin/athasha
```