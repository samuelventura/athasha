defmodule AthashaTerminal.Tryout do
  alias AthashaTerminal.Tty

  def run() do
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
    ptdev = ptsf |> String.to_charlist()
    res = Tty.linkpt(ptdev)
    File.rm(ptsk)
    res
  end

  def loop() do
    case run() do
      1 -> nil
      _ -> loop()
    end
  end
end

alias AthashaTerminal.Tryout

case System.argv() do
  ["loop"] ->
    Tryout.loop()

  _ ->
    Tryout.run()
end

# sends 1 to the fifo first
# after a second kills it if kill file still present
# exit with
# source /tmp/ash.exit
