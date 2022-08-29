defmodule Teletype do
  def chvt(tn) do
    exec = :code.priv_dir(:teletype) ++ '/native/tty_chvt'
    System.cmd("#{exec}", ["#{tn}"])
  end
end
