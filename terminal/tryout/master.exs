alias AthashaTerminal.Tty

ptsn = Tty.openpt()
ptsl = "/tmp/ash.pts"
ptsp = "/tmp/ash.pid"
ptsk = "/tmp/ash.kill"
ptsx = "/tmp/ash.exit"
ptsf = "/tmp/ash.fifo"
File.rm(ptsl)
File.ln_s!(ptsn, ptsl)
pid = System.pid()
File.write!(ptsp, "#{pid}")
File.write!(ptsx, "echo 1 > #{ptsf}\nsleep 1\ntest -f #{ptsk} && . #{ptsk}")
File.write!(ptsk, "kill -9 #{pid}")
Tty.linkpt(ptsf |> String.to_charlist())
File.rm(ptsk)

# sends 1 to the fifo first
# after a second kills it if kill file still present
# exit with
# . /tmp/ash.exit
