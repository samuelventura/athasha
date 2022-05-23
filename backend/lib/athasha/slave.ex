defmodule Athasha.Slave do
  alias Athasha.Spec

  def child_spec(_) do
    Spec.forWorker(__MODULE__)
  end

  def start_link() do
    model = %{
      1 => %{
        {:c, 0} => 0,
        {:i, 0} => 0,
        {:hr, 0} => 0,
        {:ir, 0} => 0,
        # bad idea to mix floats with integer
        {:hr, 1} => 0,
        {:ir, 1} => 0,
        {:hr, 2} => 0,
        {:ir, 2} => 0,
        {:hr, 3} => 0,
        {:ir, 3} => 0,
        {:hr, 4} => 0,
        {:ir, 4} => 0,
        {:hr, 5} => 0,
        {:ir, 5} => 0,
        {:hr, 6} => 0,
        {:ir, 6} => 0,
        {:hr, 7} => 0,
        {:ir, 7} => 0,
        {:hr, 8} => 0,
        {:ir, 8} => 0
      }
    }

    Modbus.Tcp.Slave.start_link(model: model, name: __MODULE__)
  end

  def port() do
    Modbus.Tcp.Slave.port(__MODULE__)
  end

  def get() do
    Modbus.Tcp.Slave.get(__MODULE__)
  end

  def set(model) do
    Modbus.Tcp.Slave.set(__MODULE__, model)
  end

  def reset() do
    Modbus.Tcp.Slave.reset(__MODULE__)
  end

  def exec(cmd) do
    Modbus.Tcp.Slave.exec(__MODULE__, cmd)
  end

  def fix_port(0), do: port()
  def fix_port(port), do: port
end
