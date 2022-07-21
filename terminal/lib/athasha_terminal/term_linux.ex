defmodule AthashaTerminal.TermLinux do
  @ctl 1
  @alt 2

  @resize ~r/^\e\[(\d+);(\d+)R/

  # thinkpad usb us keyboard
  @escapes [
    {"\e[[A", {0, :f1}},
    {"\e[[B", {0, :f2}},
    {"\e[[C", {0, :f3}},
    {"\e[[D", {0, :f4}},
    {"\e[[E", {0, :f5}},
    {"\e[17~", {0, :f6}},
    {"\e[18~", {0, :f7}},
    {"\e[19~", {0, :f8}},
    {"\e[20~", {0, :f9}},
    {"\e[21~", {0, :f10}},
    {"\e[23~", {0, :f11}},
    {"\e[24~", {0, :f12}},
    {"\e[1~", {0, :home}},
    {"\e[2~", {0, :insert}},
    {"\e[3~", {0, :delete}},
    {"\e[4~", {0, :end}},
    {"\e[5~", {0, :page_up}},
    {"\e[6~", {0, :page_down}},
    {"\e[A", {0, :arrow_up}},
    {"\e[B", {0, :arrow_down}},
    {"\e[C", {0, :arrow_right}},
    {"\e[D", {0, :arrow_left}}
  ]

  @singles [
    {"\d", {0, :backspace}},
    {<<0>>, {@ctl, "2"}},
    {<<28>>, {@ctl, "4"}},
    {<<29>>, {@ctl, "5"}},
    {<<30>>, {@ctl, "6"}},
    {<<31>>, {@ctl, "7"}},
    {<<17>>, {@ctl, "q"}},
    {<<23>>, {@ctl, "w"}},
    {<<5>>, {@ctl, "e"}},
    {<<18>>, {@ctl, "r"}},
    {<<20>>, {@ctl, "t"}},
    {<<25>>, {@ctl, "y"}},
    {<<21>>, {@ctl, "u"}},
    {<<15>>, {@ctl, "o"}},
    {<<16>>, {@ctl, "p"}},
    {<<1>>, {@ctl, "a"}},
    {<<19>>, {@ctl, "s"}},
    {<<4>>, {@ctl, "d"}},
    {<<6>>, {@ctl, "f"}},
    {"\a", {@ctl, "g"}},
    {"\b", {@ctl, "h"}},
    {"\v", {@ctl, "k"}},
    {"\f", {@ctl, "l"}},
    {<<26>>, {@ctl, "z"}},
    {<<24>>, {@ctl, "x"}},
    {<<3>>, {@ctl, "c"}},
    {<<22>>, {@ctl, "v"}},
    {<<2>>, {@ctl, "b"}},
    {<<14>>, {@ctl, "n"}}
    # tab -> "\t"
    # prtsc -> <<28>>
    # ctrl_` -> ctrl_2
    # ctrl_1 -> silent
    # ctrl_3 -> \e
    # ctrl_8 -> \d
    # ctrl_9 -> silent
    # ctrl_0 -> silent
    # ctrl_- -> <<31>>
    # ctrl_= -> silent
    # ctrl_back -> \b ctrl_h
    # ctrl_\t -> silent
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
    # ctrl_i -> \t
    # ctrl_j -> \n (blocked input at some point)
  ]

  @singles_map @singles |> Enum.into(%{})

  def append(buffer, data) do
    buffer = buffer <> data
    scan(buffer, [])
  end

  defp scan("", events) do
    {"", Enum.reverse(events)}
  end

  defp scan(buffer, events) do
    {prefix, event} = scan(buffer)
    buffer = tail(buffer, prefix)
    scan(buffer, [event | events])
  end

  defp scan("\e" <> _ = buffer) do
    nil
    |> escapes(buffer)
    |> resize(buffer)
    |> altkey(buffer)
    |> default({"\e", {:key, 0, "\e"}})
  end

  defp scan(<<k>> <> _) do
    nil
    |> singles(<<k>>)
    |> default({<<k>>, {:key, 0, <<k>>}})
  end

  defp singles(nil, single) do
    case Map.get(@singles_map, single) do
      nil ->
        nil

      code ->
        {flag, key} = code
        {single, {:key, flag, key}}
    end
  end

  defp singles(prev, _), do: prev

  defp escapes(nil, buffer) do
    Enum.find_value(@escapes, fn {prefix, code} ->
      case String.starts_with?(buffer, prefix) do
        true ->
          {flag, key} = code
          {prefix, {:key, flag, key}}

        false ->
          nil
      end
    end)
  end

  defp escapes(prev, _), do: prev

  defp resize(nil, buffer) do
    case Regex.run(@resize, buffer) do
      [prefix, h, w] ->
        w = String.to_integer(w)
        h = String.to_integer(h)
        {prefix, {:resize, w, h}}

      nil ->
        nil
    end
  end

  defp resize(prev, _), do: prev

  defp altkey(nil, "\e" <> <<k>> <> _) do
    case Map.get(@singles_map, <<k>>) do
      nil ->
        {"\e" <> <<k>>, {:key, @alt, <<k>>}}

      code ->
        {flag, key} = code
        flag = Bitwise.bor(flag, @alt)
        {"\e" <> <<k>>, {:key, flag, key}}
    end
  end

  defp altkey(prev, _), do: prev

  defp default(nil, def), do: def
  defp default(prev, _), do: prev

  defp tail(buffer, prefix) do
    bl = String.length(buffer)
    pl = String.length(prefix)
    String.slice(buffer, pl, bl)
  end
end
