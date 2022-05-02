
```bash
% brew install --cask dotnet-sdk
% dotnet --version
6.0.202
#https://docs.microsoft.com/en-us/dotnet/core/rid-catalog
% rm -fr ports/modbus/priv/dotnet
% (cd ports/sport && dotnet publish -r linux-x64 --self-contained)
% rsync -avr ports/sport/bin/Debug/net6.0/linux-x64/publish/* ports/modbus/priv/dotnet
% ports/modbus/priv/dotnet/sport
% (cd ports/modbus && ./test.sh)
% (cd ports/modbus && iex -S mix)

tty = "/dev/ttyUSB1"
{:ok, pid} = Serial.start_link(device: tty)
Serial.write(pid, "01234\n56789\n98765\n43210")
{:ok, "01234\n"} = Serial.readln(pid)
{:ok, "56789\n"} = Serial.readln(pid)
{:ok, "98765\n"} = Serial.readln(pid)
{:to, "43210"} = Serial.readln(pid)
```
