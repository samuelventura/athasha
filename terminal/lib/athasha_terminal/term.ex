defmodule AthashaTerminal.Term do
  def append(term, buffer, data) do
    buffer = buffer <> data
    scan(term, buffer, [])
  end

  defp match(regex, buffer) do
    captures = Regex.run(regex, buffer)

    case captures do
      nil ->
        {buffer, nil}

      [prefix | _] ->
        bl = String.length(buffer)
        pl = String.length(prefix)
        tail = String.slice(buffer, pl, bl)
        {tail, captures}
    end
  end

  defp scan(term, buffer, events) do
    case special(term, buffer) do
      {"", nil} ->
        {"", Enum.reverse(events)}

      {buffer, nil} ->
        scan(term, patterns(term), buffer, events)

      {"", captures} ->
        event = {:special, captures}
        events = [event | events]
        {"", Enum.reverse(events)}

      {stail, captures} ->
        event = {:special, captures}
        events = [event | events]
        scan(term, stail, events)
    end
  end

  defp scan(term, [{name, pattern} | ptail], buffer, events) do
    case match(pattern, buffer) do
      {buffer, nil} ->
        # ptail should never be [] here
        scan(term, ptail, buffer, events)

      {stail, captures} ->
        params = decode(term, name, captures)
        event = {name, params}
        scan(term, stail, [event | events])
    end
  end

  defp decode(_term, :resize, [a, h, w]) do
    {a, String.to_integer(w), String.to_integer(h)}
  end

  defp decode(_term, :mouse, [a, s, x, y]) do
    [s] = String.to_charlist(s)
    [x] = String.to_charlist(x)
    [y] = String.to_charlist(y)
    {a, s - 32, x - 32, y - 32}
  end

  defp decode(_term, :mouse_down, [a, b, x, y]) do
    {a, String.to_integer(b), String.to_integer(x), String.to_integer(y)}
  end

  defp decode(_term, :mouse_up, [a, b, x, y]) do
    {a, String.to_integer(b), String.to_integer(x), String.to_integer(y)}
  end

  defp decode(_term, :alt, [_, k]) do
    k
  end

  defp decode(_term, :key, [_, k]) do
    k
  end

  defp decode(_term, _name, captures) do
    captures
  end

  def special(_term, ""), do: {"", nil}

  def special(term, buffer) do
    found =
      case String.starts_with?(buffer, "\e") do
        true ->
          "\e" <> buffer = buffer

          Enum.find_value(keys(term), fn {prefix, code} ->
            case String.starts_with?(buffer, prefix) do
              true -> {"\e" <> prefix, {code, :alt}}
              false -> nil
            end
          end)

        false ->
          nil
      end

    found =
      case found do
        nil ->
          Enum.find_value(keys(term), fn {prefix, code} ->
            case String.starts_with?(buffer, prefix) do
              true -> {prefix, code}
              false -> nil
            end
          end)

        any ->
          any
      end

    case found do
      nil ->
        {buffer, nil}

      {prefix, code} ->
        bl = String.length(buffer)
        pl = String.length(prefix)
        tail = String.slice(buffer, pl, bl)
        {tail, code}
    end
  end

  @linux [
    resize: ~r/^\e\[(\d+);(\d+)R/,
    alt: ~r/^\e(.)/,
    esc: ~r/^\e/,
    key: ~r/^(.)/
  ]

  @code [
    resize: ~r/^\e\[(\d+);(\d+)R/,
    mouse: ~r/^\e\[M(.)(.)(.)/,
    mouse_down: ~r/^\e\[<(\d+);(\d+);(\d+)M/,
    mouse_up: ~r/^\e\[<(\d+);(\d+);(\d+)m/,
    alt: ~r/^\e(.)/,
    esc: ~r/^\e/,
    key: ~r/^(.)/
  ]

  defp patterns(:linux), do: @linux
  defp patterns(:code), do: @code

  # thinkpad usb us keyboard
  @linux_keys [
    {"\e[[A", :f1},
    {"\e[[B", :f2},
    {"\e[[C", :f3},
    {"\e[[D", :f4},
    {"\e[[E", :f5},
    {"\e[17~", :f6},
    {"\e[18~", :f7},
    {"\e[19~", :f8},
    {"\e[20~", :f9},
    {"\e[21~", :f10},
    {"\e[23~", :f11},
    {"\e[24~", :f12},
    {"\e[1~", :home},
    {"\e[2~", :insert},
    {"\e[3~", :delete},
    {"\e[4~", :end},
    {"\e[5~", :page_up},
    {"\e[6~", :page_down},
    {"\e[A", :arrow_up},
    {"\e[B", :arrow_down},
    {"\e[C", :arrow_right},
    {"\e[D", :arrow_left},
    {"\d", :backspace},
    {"\t", :tab},
    {<<28>>, :prtsc},
    # ctrl_` -> ctrl_2
    # ctrl_1 -> silent
    {<<0>>, :ctrl_2},
    # ctrl_3 -> \e
    # ctrl_4 -> :prtsc
    {<<29>>, :ctrl_5},
    {<<30>>, :ctrl_6},
    {<<31>>, :ctrl_7},
    # ctrl_8 -> \d
    # ctrl_9 -> silent
    # ctrl_0 -> silent
    # ctrl_- -> <<31>>
    # ctrl_= -> silent
    {"\b", :ctrl_backspace},
    # ctrl_\t -> silent
    {<<17>>, :ctrl_q},
    {<<23>>, :ctrl_w},
    {<<5>>, :ctrl_e},
    {<<18>>, :ctrl_r},
    {<<20>>, :ctrl_t},
    {<<25>>, :ctrl_y},
    {<<21>>, :ctrl_u},
    # ctrl_i -> \t
    {<<15>>, :ctrl_o},
    {<<16>>, :ctrl_p},
    {<<1>>, :ctrl_a},
    {<<19>>, :ctrl_s},
    {<<4>>, :ctrl_d},
    {<<6>>, :ctrl_f},
    {"\a", :ctrl_g},
    # ctrl_h -> \b
    # ctrl_j -> mute keyboard?
    {"\v", :ctrl_k},
    {"\f", :ctrl_l},
    {<<26>>, :ctrl_z},
    {<<24>>, :ctrl_x},
    {<<3>>, :ctrl_c},
    {<<22>>, :ctrl_v},
    {<<2>>, :ctrl_b},
    {<<14>>, :ctrl_n}
    # ctrl_m -> \r
    # ctrl_[ -> \e
    # ctrl_] -> ctrl_5
    # ctrl_\ -> :prtsc
    # ctrl_; -> silent
    # ctrl_' -> ctrl_g
    # ctrl_, -> silent
    # ctrl_. -> silent
    # ctrl_/ -> silent
    # ctrl_space -> ctrl_2
  ]

  defp keys(:linux), do: @linux_keys
end
