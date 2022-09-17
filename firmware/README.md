# AthashaFirmware

```bash
# rpi4 30x100
mkdir firmware
cd firmware
mix nerves.new . --app athasha_firmware
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
#cd ../teletype && mix clean
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
# dev machine
System.cmd "epmd",["-daemon"]
Node.start :"code@172.31.255.10"
Node.set_cookie :COOKIE
Node.connect :"target@172.31.255.9"
System.put_env("VintageNode", "target@172.31.255.9")
# ~/src/teletype/priv/master
# TROUBLE GETTING NERVES TO COMPILE TELETYPE WITH TARGET=LINUX-HOST
{:ok, pid} = Terminal.Runner.start_link tty: {Teletype.Tty, "/tmp/slave.pts"}, term: Terminal.Code, app: {VintageApp, nics: VintageApi.configured_nics()}
Process.exit pid, :kill
System.cmd "killall",["master"]
# rpi4
{:ok, pid} = Terminal.Runner.start_link tty: {Teletype.Tty, "/dev/tty1"}, term: Terminal.Linux, app: {VintageApp, nics: VintageApi.configured_nics()}
Process.exit pid, :kill
# monitor linux keys
tty = Teletype.Tty.open("/dev/tty1")
{tty, data} = Teletype.Tty.read!(tty) 
{"", events} = Terminal.Linux.append("", data)
Teletype.Slave.close(tty) 
# socat file:/dev/tty,raw,icanon=0,echo=0,min=0,escape=0x03 tcp-l:8881,reuseaddr
# socat STDIO fails with: Inappropriate ioctl for device
# no resize event is received with this method
# raw required to avoid translating \r to \n
# min=0 required to answer size query immediatelly
# fork useless because term won't answer size query on reconnection
# escape=0x03 required to honor escape sequences
# while true; do socat file:/dev/tty,raw,icanon=0,echo=0,escape=0x03,min=0 tcp-l:8881,reuseaddr; done
# to exit: ctrl-z, then jobs, then kill %1
#
# socat file:/dev/tty,nonblock,raw,icanon=0,echo=0,min=0,escape=0x03 tcp:127.0.0.1:8881
# client socat to test immediate transmission of typed keys on both ends
# escape=0x03 reqired to honor ctrl-c
#
# echo -en "\033[1mThis is bold text.\033[0m" | nc 127.0.0.1 8881
# to test server end honors escapes
{:ok, pid} = Terminal.Runner.start_link tty: {Terminal.Socket, ip: "127.0.0.1", port: 8881}, term: Terminal.Code, app: {VintageApp, nics: VintageApi.configured_nics()}
Process.exit pid, :kill
```

## Future

- Hard reset of all interfaces
- Static with optional gw/ns
- Extract gw/ns from DHCP
- Catch get_config errors
- Wifi security selector
- SSID scan selector
