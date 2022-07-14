defmodule AthashaTerminal.SVT do
  # @compile {:autoload, false}
  # @on_load :init

  @doc false
  def init() do
    nif = :code.priv_dir(:sniff) ++ '/svt'
    :erlang.load_nif(nif, 0)
  end

  def svt(_tty) do
    :erlang.nif_error("NIF library not loaded")
  end
end
