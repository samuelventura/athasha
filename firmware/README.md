# AthashaFirmware

```bash
# rpi4 30x100
mkdir firmware
cd firmware
mix nerves.new . --app athasha_firmware
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix upload athasha-4ad8.local
ssh athasha-4ad8.local
ssh 172.31.255.9
```

## Terminal App Development

```elixir
# rpi4 over usb nic
cmd "epmd -daemon"
Node.start :"target@172.31.255.9"
Node.set_cookie :COOKIE
# teletype/priv/master
System.cmd "epmd",["-daemon"]
Node.start :"code@172.31.255.10"
Node.set_cookie :COOKIE
Node.connect :"target@172.31.255.9"
System.put_env("VintageNode", "target@172.31.255.9")
{:ok, pid} = Terminal.Runner.start_link tty: {Teletype.Tty, "/tmp/slave.pts"}, term: Terminal.Code, app: {VintageApp, nics: VintageApi.available_nics()}
Process.exit pid, :kill
System.cmd "killall",["master"]
# socat file:/dev/tty,icanon=0,echo=0,min=0,escape=0x03 tcp-l:8881,reuseaddr
# socat STDIO fails with: Inappropriate ioctl for device
# min=0 required to answer size query immediatelly
# fork useless because term won't answer size query on reconnection
# escape=0x03 required to honor escape sequences
# while true; do socat file:/dev/tty,icanon=0,echo=0,escape=0x03,min=0 tcp-l:8881,reuseaddr; done
# to exit: ctrl-z, then jobs, then kill %1
#
# socat file:/dev/tty,nonblock,raw,icanon=0,echo=0,min=0,escape=0x03 tcp:127.0.0.1:8881
# client socat to test immediate transmission of typed keys on both ends
# escape=0x03 reqired to honor ctrl-c
#
# echo -en "\033[1mThis is bold text.\033[0m" | nc 127.0.0.1 8881
# to test server end honors escapes
{:ok, pid} = Terminal.Runner.start_link tty: {Terminal.Socket, ip: "127.0.0.1", port: 8881}, term: Terminal.Code, app: {VintageApp, nics: VintageApi.available_nics()}
```
