defmodule AthashaFirmware.VintageApi do
  alias AthashaFirmware.VintageLib

  def nameservers() do
    VintageLib.get_by_prefix(["name_servers"])
  end

  def configured_nics() do
    VintageLib.get_all_env()
    |> Keyword.get(:config)
    |> Enum.filter(fn {_, conf} ->
      case conf do
        %{type: VintageNetWiFi} -> true
        %{type: VintageNetEthernet} -> true
        _ -> false
      end
    end)
    |> Enum.map(fn {nic, _} -> nic end)
  end

  def available_nics() do
    res = VintageLib.get_by_prefix(["available_interfaces"])
    [{["available_interfaces"], nics}] = res
    nics
  end

  def ips({a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  def nms(n), do: ips(VintageLib.prefix_length_to_subnet_mask(n))

  def nmn(nm) do
    {:ok, ip} = :inet.parse_address(String.to_charlist(nm))

    case VintageLib.subnet_mask_to_prefix_length(ip) do
      {:ok, n} -> n
      {:error, _} -> raise "Invalid netmask #{nm}"
    end
  end

  def valid_ip!(text, msg) do
    case :inet.parse_address(String.to_charlist(text)) do
      {:ok, _} -> nil
      {:error, _} -> raise "#{msg}: #{text}"
    end
  end

  def same_segment!(netmask, address, gateway) do
    {:ok, {n0, n1, n2, n3}} = :inet.parse_address(String.to_charlist(netmask))
    {:ok, {a0, a1, a2, a3}} = :inet.parse_address(String.to_charlist(address))
    {:ok, {g0, g1, g2, g3}} = :inet.parse_address(String.to_charlist(gateway))
    as = {Bitwise.band(n0, a0), Bitwise.band(n1, a1), Bitwise.band(n2, a2), Bitwise.band(n3, a3)}
    gs = {Bitwise.band(n0, g0), Bitwise.band(n1, g1), Bitwise.band(n2, g2), Bitwise.band(n3, g3)}
    if as != gs, do: raise("Invalid gateway segment #{gateway}")
  end

  def get_mac(nic) do
    case VintageLib.get_by_prefix(["interface", nic, "mac_address"]) do
      [{["interface", ^nic, "mac_address"], value}] -> value
      _ -> ""
    end
  end

  def get_default(nic) do
    env = VintageLib.get_all_env()
    defaults = Keyword.fetch!(env, :config)
    defaults = Enum.into(defaults, %{})
    Map.fetch!(defaults, nic)
  end

  def get_address_netmask(nic) do
    list =
      case(VintageLib.get_by_prefix(["interface", nic, "addresses"])) do
        [] -> []
        [{["interface", ^nic, "addresses"], list}] -> list
      end

    Enum.find_value(list, {"", ""}, fn m ->
      %{family: f, address: ip, netmask: nm} = m

      case f do
        :inet -> {ips(ip), ips(nm)}
        _ -> false
      end
    end)
  end
end
