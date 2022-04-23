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
