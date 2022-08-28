defmodule AthashaTerminal.Term do
  defmacro __using__(module: module) do
    quote do
      import unquote(module)

      use AthashaTerminal.Const

      def term_encode(list) when is_list(list) do
        list = term_encode([], list)
        :lists.reverse(list)
      end

      defp term_encode(_, list, []), do: list

      defp term_encode(list, [{:m, x, y} | tail]) do
        d = term_cursor(x, y)
        term_encode([d | list], tail)
      end

      defp term_encode(list, [{:d, d} | tail]) do
        d = :lists.reverse(d)
        d = IO.chardata_to_string(d)
        term_encode([d | list], tail)
      end

      defp term_encode(list, [{:s, s1, s2} | tail]) do
        b1 = Bitwise.band(s1, @bold)
        b2 = Bitwise.band(s2, @bold)
        d1 = Bitwise.band(s1, @dimmed)
        d2 = Bitwise.band(s2, @dimmed)
        i1 = Bitwise.band(s1, @inverse)
        i2 = Bitwise.band(s2, @inverse)

        list =
          case {b1, b2, d1, d2} do
            {@bold, 0, _, @dimmed} -> [term_reset(:normal), term_set(:dimmed) | list]
            {_, @bold, @dimmed, 0} -> [term_reset(:normal), term_set(:bold) | list]
            {@bold, 0, _, _} -> [term_reset(:normal) | list]
            {_, _, @dimmed, 0} -> [term_reset(:normal) | list]
            {0, @bold, _, _} -> [term_set(:bold) | list]
            {_, _, 0, @dimmed} -> [term_set(:dimmed) | list]
            _ -> list
          end

        list =
          case {i1, i2} do
            {0, @inverse} -> [term_set(:inverse) | list]
            {@inverse, 0} -> [term_reset(:inverse) | list]
            _ -> list
          end

        term_encode(list, tail)
      end

      defp term_encode(list, [{:b, b} | tail]) do
        d = term_color(:bgcolor, b)
        term_encode([d | list], tail)
      end

      defp term_encode(list, [{:f, f} | tail]) do
        d = term_color(:fgcolor, f)
        term_encode([d | list], tail)
      end

      defp term_encode(list, [{:c, c} | tail]) do
        d =
          case c do
            true -> term_show(:cursor)
            false -> term_hide(:cursor)
          end

        term_encode([d | list], tail)
      end
    end
  end
end
