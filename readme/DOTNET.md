
```bash
% brew install --cask dotnet-sdk
% dotnet --version
6.0.202
% dotnet --info | grep RID
 RID:         ubuntu.20.04-x64
#https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
% rm -fr native/ports/priv/dotnet
% (cd native/serial && dotnet publish -r linux-x64 --self-contained)
% rsync -avr native/serial/bin/Debug/net6.0/linux-x64/publish/* native/ports/priv/dotnet
% native/ports/priv/dotnet/serial
% (cd native/modbus && ./test.sh)
% (cd native/modbus && iex -S mix)

tty = "/dev/ttyUSB1"
{:ok, pid} = Serial.start_link(device: tty)
Serial.write(pid, "01234\n56789\n98765\n43210")
{:ok, "01234\n"} = Serial.readln(pid)
{:ok, "56789\n"} = Serial.readln(pid)
{:ok, "98765\n"} = Serial.readln(pid)
{:to, "43210"} = Serial.readln(pid)
```
