# HOWTO

```bash
mkdir app
cd app
mix phx.new . --app athasha --database sqlite3 --live
mix deps.get
mix ecto.create
mix phx.server
iex -S mix phx.server
```

## Architecture

- IO Server
  - Grouped by device
  - A custom IO server (OPC)
  - API (change and read event)
- Data Loggers, Web Views, DB Links
  - Connect to io-server API

## Use Cases

- Laurel Monitor
  - No buttons
  - Web viewer
  - Data recording
  - Alarms
- Modbus Monitor
  - Digital or analog
  - Widget

## Research

- Installer
- Auth2
- License
- Setup (TCP ports, ...)
- HTTPS
