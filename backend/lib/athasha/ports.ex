defmodule Athasha.Ports do
  def open(name, args \\ []) do
    exec = exec(name)
    opts = [:binary, :exit_status, packet: 2, args: args]
    Port.open({:spawn_executable, exec}, opts)
  end

  def open4(name, args \\ []) do
    exec = exec(name)
    opts = [:binary, :exit_status, packet: 4, args: args]
    Port.open({:spawn_executable, exec}, opts)
  end

  def read_lines(name, args \\ []) do
    port = open_lines(name, args)
    read_line(port, [])
  end

  defp open_lines(name, args) do
    exec = exec(name)
    opts = [:binary, :exit_status, line: 256, args: args]
    Port.open({:spawn_executable, exec}, opts)
  end

  defp read_line(port, list) do
    receive do
      {^port, {:data, {:eol, line}}} -> read_line(port, [line | list])
      {^port, {:data, line}} -> read_line(port, [line | list])
      {^port, {:exit_status, _}} -> list
    end
  end

  defp exec(name) do
    exec =
      case :os.type() do
        {:unix, :darwin} -> "/dotnet/#{name}"
        {:unix, :linux} -> "/dotnet/#{name}"
        {:win32, :nt} -> "/dotnet/#{name}.exe"
      end

    Path.join(:code.priv_dir(:ports), exec)
  end
end
