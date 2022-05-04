defmodule Athasha.Monitor do
  alias Athasha.Raise
  # 1hr in millis
  @check 1000 * 60 * 60

  def start_link() do
    spawn_link(&monitor_init/0)
  end

  defp monitor_check() do
    IO.inspect({"monitor_check"})
    # disable exceding licenses
  end

  defp monitor_init() do
    Process.send(self(), :check, @check)
    monitor_loop()
  end

  defp monitor_loop() do
    receive do
      :check ->
        monitor_check()
        Process.send_after(self(), :check, @check)
        monitor_loop()

      other ->
        Raise.error({:receive, other})
    end
  end
end
