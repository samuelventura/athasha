
- curses based terminal
- curses screens with mouse
- on screen keyboard
- on screen settings
- must support tester devel
- future framebuffer support

mix nerves.new . --app athasha_terminal
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix upload athasha-4ad8
ssh athasha-4ad8

MIX_TARGET=rpi3 mix deps.get
MIX_TARGET=rpi3 mix compile
MIX_TARGET=rpi3 mix firmware
MIX_TARGET=rpi3 mix upload 
ssh athasha-ee0c

MIX_TARGET=x86_64 mix deps.get
MIX_TARGET=x86_64 mix firmware.image
MIX_TARGET=x86_64 mix nerves.gen.qemu_script

qemu-system-x86_64 -enable-kvm -m 512M \
    -drive file=athasha_terminal.img,if=virtio,format=raw \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::8022-:22 \
    -serial stdio

#local development on konsole
mix run tryout/term.exs loop
mix run tryout/term.exs
source /tmp/ash.exit

mix run tryout/try_ansi.exs
mix run tryout/try_escapes.exs
mix run tryout/try_monitor.exs

#on device development
ssh athasha-4ad8 < tryout/shell.exs
ssh athasha-4ad8 < tryout/try_ansi.exs
ssh athasha-4ad8 < tryout/try_escapes.exs
ssh athasha-4ad8 < tryout/try_monitor.exs

mousedev
cmd "find /lib/modules/5.15.32-v8/kernel -name *.ko"
cmd "ls /dev/input/"
cmd "ls /sys/module/"
cmd "lsmod" 
