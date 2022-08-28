defmodule AthashaTerminal.StdioTty do
  @behaviour AthashaTerminal.Tty

  def tty_open(tty: tty) do
    file = File.open!(tty, [:read, :write])
    {_, 0} = System.cmd("stty", ["-F", tty, "raw", "-echo"])
    {file, tty}
  end

  def tty_close({file, tty}) do
    {_, 0} = System.cmd("stty", ["-F", tty, "sane"])
    File.close(file)
  end

  def tty_read!({file, tty}) do
    case IO.read(file, 1) do
      :oef -> raise "EOF"
      {:error, error} -> raise "#{inspect(error)}"
      data -> {{file, tty}, data}
    end
  end

  def tty_write!({file, tty}, data) do
    :ok = IO.write(file, data)
    {file, tty}
  end
end
