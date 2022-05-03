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
- https://www.sarasoueidan.com/blog/svg-coordinate-systems/
- https://www.sarasoueidan.com/blog/mimic-relative-positioning-in-svg/
- https://www.sarasoueidan.com/demos/interactive-svg-coordinate-system/
