
- curses based terminal
- curses screens with mouse
- on screen keyboard
- on screen settings
- must support tester devel
- future framebuffer support

#30x100
mix nerves.new . --app athasha_terminal
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix firmware.image
MIX_TARGET=rpi4 mix upload athasha-4ad8.local
ssh athasha-4ad8

#30x80
MIX_TARGET=rpi3 mix deps.get
MIX_TARGET=rpi3 mix compile
MIX_TARGET=rpi3 mix firmware.image
MIX_TARGET=rpi3 mix burn
MIX_TARGET=rpi3 mix burn --task upgrade
#update fails most of the times
MIX_TARGET=rpi3 mix upload athasha-ee0c.local
MIX_TARGET=rpi3 mix upload athasha-62c2.local
MIX_TARGET=rpi3 ./upload.sh athasha-ee0c.local
ssh athasha-ee0c
ssh athasha-62c2

#bbb
ssh athasha-4199

#25x80
MIX_TARGET=x86_64 mix deps.get
MIX_TARGET=x86_64 mix compile
MIX_TARGET=x86_64 mix firmware.image
MIX_TARGET=x86_64 mix nerves.gen.qemu_script
MIX_TARGET=x86_64 mix firmware.gen.script
#this upgrades by default
MIX_TARGET=x86_64 SSH_OPTIONS="-p 8022" ./upload.sh localhost

#linux
qemu-system-x86_64 -enable-kvm -m 512M \
    -drive file=athasha_terminal.img,if=virtio,format=raw \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::8022-:22 \
    -serial stdio

#macos
qemu-system-x86_64 -m 512M \
    -drive file=athasha_terminal.img,if=virtio,format=raw \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::8022-:22 \
    -serial stdio

#local development on konsole/vscode
priv/native/tty_master; reset
cat /tmp/ash.tty
echo "hello" > /tmp/ash.tty
stty -f /dev/ttys004 raw -echo
killall tty_master
System.cmd "killall",["tty_master"]
#from elixir port only
#priv/native/tty_slave /tmp/ash.tty
#from iex -S mix
ALT+F1, ALT+F2, ALT+LEFT, ALT+RIGHT
Tty.chvt(2)
Tryout.run "tryout/try_monitor.exs"
Tryout.run Tryout, :export, ["/dev/tty2", 8899]
Tryout.run Tryout, :monitor, [:code, "/tmp/ash.tty", :mext]
Tryout.run Tryout, :monitor, [:code, "/tmp/ash.tty", :mstd]
Tryout.run Tryout, :monitor, [:linux, "/dev/tty2", :mext]
Tryout.run Tryout, :monitor, [:linux, "athasha-4ad8", 8899, :mext]
Tryout.run Tryout, :monitor, [:linux, "athasha-ee0c", 8899, :mext]
nc athasha-4ad8 8899
nc localhost 8899
{:ok, pid} = AppRunner.start_link VintageApp, "/tmp/ash.tty", :code
Process.exit pid, :kill
System.put_env("VintageRemote", "target@172.31.255.9")
VintageLib.get_configuration "eth0"

mix run tryout/try_hello.exs
mix run tryout/try_ansi.exs
mix run tryout/try_escapes.exs
mix run tryout/try_monitor.exs

#on device development
ssh athasha-4ad8 < tryout/shell.exs
ssh athasha-4ad8 < tryout/export.exs
nc athasha-4ad8 8899 
ssh athasha-4ad8 < tryout/try_hello.exs
ssh athasha-4ad8 < tryout/try_ansi.exs
ssh athasha-4ad8 < tryout/try_escapes.exs
ssh athasha-4ad8 < tryout/try_monitor.exs
ssh athasha-ee0c < tryout/try_monitor.exs
ssh localhost -p 8022 < tryout/try_monitor.exs

mousedev
cmd "find /lib/modules/5.15.32-v8/kernel -name *.ko"
cmd "ls /dev/input/"
cmd "ls /sys/module/"
cmd "lsmod" 
