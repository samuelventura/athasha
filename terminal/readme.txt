https://tldp.org/HOWTO/NCURSES-Programming-HOWTO/index.html
https://tldp.org/HOWTO/Text-Terminal-HOWTO.html
https://tldp.org/HOWTO/Keyboard-and-Console-HOWTO.html
https://hexdocs.pm/elixir/1.12/IO.ANSI.html
https://en.wikipedia.org/wiki/ANSI_escape_code
https://hex.pm/packages/ex_ncurses
https://ndreynolds.com/posts/2019-01-27-terminal-apps-with-elixir.html
https://github.com/nsf/termbox
https://github.com/ndreynolds/ex_termbox
https://github.com/ndreynolds/ratatouille
https://hex.pm/packages/ratatouille
http://www.linusakesson.net/programming/tty/index.php
https://sw.kovidgoyal.net/kitty/keyboard-protocol/
https://github.com/samuelventura/baud/blob/Modbus_In_C/src
https://kernel.googlesource.com/pub/scm/linux/kernel/git/legion/kbd/+/1.10/openvt/openvt.c

- curses based terminal
- curses screens with mouse
- on screen keyboard
- on screen settings
- must support tester devel
- future framebuffer support

mkdir terminal
cd terminal
mkdir src
cd src
git submodule add git@github.com:samuelventura/termbox.git
cd ..

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

#termbox fails to start
MIX_TARGET=x86_64 mix deps.get
MIX_TARGET=x86_64 mix firmware.image
MIX_TARGET=x86_64 mix nerves.gen.qemu_script

qemu-system-x86_64 -enable-kvm -m 512M \
    -drive file=athasha_terminal.img,if=virtio,format=raw \
    -net nic,model=virtio \
    -net user,hostfwd=tcp::8022-:22 \
    -serial stdio

iex -S mix

alias AthashaTerminal.TTY

port = TTY.open ["c2"]

port = TTY.open
TTY.chvt port, 2
TTY.chvt port, 1

port = TTY.open
TTY.openvt port, 2

tty = TTY.ttyname |> to_string
TTY.openvt port, tty
