defmodule AthashaTerminal.VintageLib do
  def remote() do
    System.get_env("VintageNode", "none")
    |> String.to_atom()
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

  def get_by_prefix(filter) do
    case remote() do
      :none -> apply(VintageNet, :get_by_prefix, [filter])
      node -> :rpc.call(node, VintageNet, :get_by_prefix, [filter])
    end
  end

  def prefix_length_to_subnet_mask(prefix) do
    case remote() do
      :none -> apply(VintageNet.IP, :prefix_length_to_subnet_mask, [:inet, prefix])
      node -> :rpc.call(node, VintageNet.IP, :prefix_length_to_subnet_mask, [:inet, prefix])
    end
  end

  def subnet_mask_to_prefix_length(netmask) do
    case remote() do
      :none -> apply(VintageNet.IP, :subnet_mask_to_prefix_length, [netmask])
      node -> :rpc.call(node, VintageNet.IP, :subnet_mask_to_prefix_length, [netmask])
    end
  end
end
