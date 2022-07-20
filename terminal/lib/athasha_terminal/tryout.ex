defmodule AthashaTerminal.Tryout do
  def run(file) do
    pid0 = self()

    pid1 =
      spawn_link(fn ->
        try do
          Code.eval_file(file)
        rescue
          e ->
            IO.inspect("#{inspect(e)}")
        end

        send(pid0, :done)
      end)

    pid2 =
      spawn_link(fn ->
        IO.gets("enter to stop>")
        send(pid0, :gets)
      end)

    receive do
      _ ->
        Process.exit(pid1, :kill)
        Process.exit(pid2, :kill)
    end
  end
end
