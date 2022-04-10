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
mix phx.gen.schema Session sessions token:string
mix phx.gen.schema Item items name:string type:string version:integer config:string
mix ecto.migrate

sudo npm -g install yarn
brew install yarn
npx create-react-app frontend
cd frontend
yarn start
#http://localhost:3000/
yarn test
yarn add bootstrap react-bootstrap
yarn add react-router-dom@6 history@5

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

## Research

- Installer
- Auth2
- License
- Setup (TCP ports, ...)
- HTTPS
