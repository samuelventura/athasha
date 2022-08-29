# athasha
Automation Now

# /firmware

Nerves project to host the device setup applications (nic), the runtime, and the user applications.

```bash
#30x100 rpi4 + touch display
mix clean #clean host native code
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix upload athasha-4ad8.local
ssh athasha-4ad8.local
```

```elixir
{:ok, pid} = TtyExport.start_link 1, 8080
```

FIXME: Configure NIC over BLE.

