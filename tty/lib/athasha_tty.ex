defmodule AthashaTty do
  def chvt(tn) do
    exec = :code.priv_dir(:athasha_tty) ++ '/native/tty_chvt'
    System.cmd("#{exec}", ["#{tn}"])
  end

  def target() do
    Application.get_env(:athasha_tty, :target)
  end

  def exit() do
    # exit from nerves shell (works in host as well)
    Process.exit(Process.group_leader(), :kill)
  end
end
