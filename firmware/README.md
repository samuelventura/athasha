# AthashaFirmware

```bash
mkdir firmware
cd firmware
mix nerves.new . --app athasha_firmware
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix firmware.image
MIX_TARGET=rpi4 mix upload athasha-4ad8.local
ssh athasha-4ad8.local
ssh 172.31.255.9
```


```elixir
#rpi4
cmd "epmd -daemon"
Node.start :"target@172.31.255.9"
Node.set_cookie :COOKIE
exit
```

```elixir
System.cmd "epmd",["-daemon"]
Node.start :"code@172.31.255.10"
Node.set_cookie :COOKIE
Node.connect :"target@172.31.255.9"
System.put_env("VintageNode", "target@172.31.255.9")
{:ok, pid} = Terminal.Runner.start_link {Terminal.Teletype, "/tmp/teletype.pts"}, Terminal.Code, {VintageMain, nics: Vintage.available_nics()}
Process.exit pid, :kill
```