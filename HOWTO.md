# HOWTO

```bash
mkdir backend
cd backend
mix phx.new . --app athasha --database sqlite3 --live
mix deps.get
mix ecto.create
mix phx.server
iex -S mix phx.server
#config contains a json with bus and points settings
mix phx.gen.schema Session sessions origin:string
mix phx.gen.schema Item items name:string type:string version:integer enabled:boolean config:string
mix ecto.drop
mix ecto.migrate

sudo npm -g install yarn
brew install yarn
yarn create vite
cd frontend
yarn dev
#http://localhost:3000/
yarn build
yarn preview

#code editor from https://github.com/YeicoLabs/tryout01_athasha
#file browser from https://github.com/YeicoLabs/tryout01_athasha
#auth context from https://github.com/YeicoLabs/tryout02_athasha
#socket pubsub from https://github.com/YeicoLabs/tryout05_athasha
```

## Development

- Initial empty password for quick login

## Strategy

- Avoid abstraction jail
- Single concurrent user UI: rest instead of websocket
- Single super user role: single password to manage
- First complete a usable set of UI based features (for technicians)

## Authentication

- Auth over websocket?
- Single super user
- Secure even over HTTP
- GET /logout?sid=SID
- GET /login?rt=UUID&et=XYZ...
  - rt: raw token cannot be reused ever
  - et: oneway password encrypted token
  - disables any other session
  - return session id
- Change password thru localhost ssh app
- Exported items have their own login system

## Architecture

- IO Server
  - Grouped by device
  - A custom IO server (OPC)
  - API (change and read event)
- Data Loggers, Web Views, DB Links
  - Connect to io-server API
- Serial Terminal, Modbus Terminal, ...
- Scripts

## Use Cases

- Laurel Monitor
  - No buttons
  - Web viewer
  - Data recording
  - Alarms
- Modbus Monitor
  - Digital or analog
  - Widget
- Datalogger

## Simplifications

- Client side logs are most valuable for devices failing to connect so no need to cache the logs for troubleshooting, just show those generated after client connects.
- Last status is what matters. Timestamps are not really neaded and must be server side for first render to be in sync.
- No need to show updated status in first render. Blue enabled is ok.
- No need to check for point name uniqueness because second regiter failes and second update overwrites.
- Timestaps can be automatically created on insert by specifying a timestamp default for that column.
- No need to reset id sequence during item by item restore since ecto keeps track of the largest id inserted.

## First Beta

- Modbus Reader + MSSQL Database Writer
- Opto22 float and Laurel reading
- Backdoor: 
  - Local setup only
  - Full database reset (for unrecoverable errors)
  - Password reset / change
  - Nerves IP setup
  - App restart
- Rock solid
  - Process crash/kill recovery
  - Process count

## Research

- Installer
- Auth2
- License
- Setup (TCP ports, ...)
- HTTPS
- Unbounded erlang integer to JSON

## Refereces

- https://kentcdodds.com/blog/how-to-use-react-context-effectively
- https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f
- https://furlough.merecomplexities.com/elixir/phoenix/tutorial/2021/02/19/binary-websockets-with-elixir-phoenix.html
- http://saule1508.github.io/create-react-app-proxy-websocket/
- https://gist.github.com/htp/fbce19069187ec1cc486b594104f01d0
- https://createreactapp.github.io/proxying-api-request
- https://github.com/samuelventura/SharpMaster/blob/master/SharpMaster/ReadFloatControl.cs

```bash
curl --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Host: localhost:4000" \
     --header "Origin: localhost:4000" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     http://localhost:4000/items/websocket
```

```elixir
export ERL_AFLAGS="-kernel shell_history enabled"
%{
  connect_info: %{},
  endpoint: AthashaWeb.Endpoint,
  options: [
    path: "/websocket",
    serializer: [
      {Phoenix.Socket.V1.JSONSerializer, "~> 1.0.0"},
      {Phoenix.Socket.V2.JSONSerializer, "~> 2.0.0"}
    ],
    error_handler: {Phoenix.Transports.WebSocket, :handle_error, []},
    timeout: 60000,
    transport_log: false,
    compress: false
  ],
  params: %{},
  transport: :websocket
}

recompile
:observer.start()
Application.stop(:athasha)
Application.start(:athasha)
Process.list()
Process.info(self())
Process.registered() |> Enum.filter(&(Atom.to_string(&1) |> String.contains?("Athasha")))
Process.registered() |> Enum.filter(&(Atom.to_string(&1) |> String.contains?("DB")))
Process.whereis(Athasha.Server) |> Process.exit(:kill)
Process.whereis(Athasha.Runner) |> Process.exit(:kill)
Ecto.Adapters.SQL.query(Repo, "select * from items")
samuel@p3420:~/github/athasha/backend$ sqlite3 athasha_dev.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> .schema
CREATE TABLE IF NOT EXISTS "schema_migrations" ("version" INTEGER PRIMARY KEY, "inserted_at" TEXT_DATETIME);
CREATE TABLE IF NOT EXISTS "items" ("id" INTEGER PRIMARY KEY, "name" TEXT, "type" TEXT, "enabled" BOOLEAN DEFAULT false NOT NULL, "config" TEXT, "inserted_at" TEXT_DATETIME NOT NULL, "updated_at" TEXT_DATETIME NOT NULL);

iex(4)> Application.fetch_env!(:athasha, Athasha.Repo)
[
  database: "/home/samuel/github/athasha/backend/athasha_dev.db",
  pool_size: 5,
  show_sensitive_data_on_connection_error: true
]
item = %{id: 9999, name: "name", type: "type", enabled: false, config: "{}"}
Item.changeset(%Item{}, item) |> Repo.insert()
Item.changeset(%Item{}, item, :id) |> Repo.insert()
Repo.delete(%Item{id: 9999})
#SQL Server Tryout
{:ok, pid} = Tds.start_link([hostname: "10.77.3.211", username: "tryout", password: "tryout", database: "tryout", port: 1433])
Tds.query!(pid, "insert into dbo.Table1 (ID, NAME) values (@p1, @p2)", [%Tds.Parameter{name: "@p1", value: "1"}, %Tds.Parameter{name: "@p2", value: "NAME1"}])
Tds.query!(pid, "select * from dbo.Table1", [])
#SQL Server datalog
{:ok, pid} = Tds.start_link([hostname: "10.77.3.211", username: "sa", password: "123", database: "datalog", port: 1433])
Tds.query!(pid, "insert into dbo.Table1 (COL1) values (@1)", [%Tds.Parameter{name: "@1", value: "1"}])
Tds.query!(pid, "select * from dbo.Table1", [])
Tds.query!(pid, "insert into dbo.Table2 (COL1) values (@1)", [%Tds.Parameter{name: "@1", value: "1.2"}])
Tds.query!(pid, "select * from dbo.Table2", [])
#SQL Server data types and defaults
int, float, datetime = (getdate())
```

## Unsupported

- scrollIntoViewIfNeeded ff 99.0 (64-bit)

## TODO and IDEA box

- Raise even on normal runner exit: defensive?
- UUID for item ids
- Screen designer
- Widget designer and publisher: cloud, svg, liveview?...
- Simple table based point viewer
- Data viewer (from database)
- REST/WS point exporter
- Separated page editors
- Code editor/runner (like notebook)
- Backup/restore individual items
- Replace sniff with sport (security and no polling)
- Multi database support for database runner
- Shared queues, stacks, maps, ...
- Native PLC drivers: AB, Fanuc, Siemens, ...
- Modbus ASCII support
- Output IO support for modbus runner
- Opto22 native driver runner (module + point addresses, edge detectors, counters, ...)
- Sandbox runner dependencies: Tds, Baud, ...
- Runners on their own beam node or port
- SharpTerminal/SharpMaster similar tools
- Modbus slave editor / viewer
- USB serial ports persistent names
- Bluetooth + smartphone setup
- Windows installer and config editor (port / password)
- Precompiled plugin repository
- Pre Built port based plugin drivers
- Plugin = module + native port (c/c++/go/rust)
- Channel manager clone
- Multi project/user
- Hide action links until item selected
- Item status/log viewer (popup?)

- EXTENSIBLES
- Device/PAC/PLC/instrument drivers
- Database drivers
- Widgets
- Elixir packages: Excel parser, Google Drive, ...

- RESEARCH
- Publish prebuild NIFs and PORTS in hex
- LiveView advanced client side interactions: forms, modals, d&d
- elixir Livebook code editor with intellisense
- React state change event to avoid useEffect hacks
- Elixir Desktop: convert app from web to desktop
- Grisp vs nerves

- OTHER IDEAS
- Scenic html canvas driver
- raspberry pi display scenic industrial HMI
- x86 NUC nerves + scenic