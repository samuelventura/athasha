defmodule AthashaTerminal.VintageLib do
  def remote() do
    System.get_env("VintageNode", "none")
    |> String.to_atom()
  end

  def get_mac!(nic) do
    case remote() do
      :none -> apply(MACAddress, :mac_address!, [nic])
      node -> :rpc.call(node, MACAddress, :mac_address!, [nic])
    end
  end

  def get_configuration(nic) do
    case remote() do
      :none -> apply(VintageNet, :get_configuration, [nic])
      node -> :rpc.call(node, VintageNet, :get_configuration, [nic])
    end
  end

  def get_all_env() do
    case remote() do
      :none -> apply(Application, :get_all_env, [:vintage_net])
      node -> :rpc.call(node, Application, :get_all_env, [:vintage_net])
    end
  end

  def configure(nic, config) do
    case remote() do
      :none -> apply(VintageNet, :configure, [nic, config])
      node -> :rpc.call(node, VintageNet, :configure, [nic, config])
    end
  end

  def deconfigure(nic) do
    case remote() do
      :none -> apply(VintageNet, :deconfigure, [nic])
      node -> :rpc.call(node, VintageNet, :deconfigure, [nic])
    end
  end

  def reset_to_defaults(nic) do
    case remote() do
      :none -> apply(VintageNet, :reset_to_defaults, [nic])
      node -> :rpc.call(node, VintageNet, :reset_to_defaults, [nic])
    end
  end
end
