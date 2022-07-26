defmodule AthashaTerminal.Canvas do
  @bold 1
  @dimmed 2
  @inverse 4

  @black 0
  @red 1
  @green 2
  @yellow 3
  @blue 4
  @magenta 5
  @cyan 6
  @white 7

  def new(width, height) do
    %{
      data: %{},
      width: width,
      height: height,
      cursor_x: 0,
      cursor_y: 0,
      cursor: false,
      foreground: @white,
      background: @black,
      style: 0
    }
  end

  def clear(%{width: width, height: height}, :all) do
    new(width, height)
  end

  def clear(canvas, :screen) do
    %{canvas | data: %{}}
  end

  def clear(canvas, :styles) do
    %{canvas | foreground: @white, background: @black, style: 0}
  end

  def cursor(canvas, x, y) do
    %{canvas | cursor_x: x, cursor_y: y}
  end

  def show(canvas, :cursor) do
    %{canvas | cursor: true}
  end

  def hide(canvas, :cursor) do
    %{canvas | cursor: false}
  end

  def color(canvas, :foreground, id) do
    %{canvas | foreground: num(id)}
  end

  def color(canvas, :background, id) do
    %{canvas | background: num(id)}
  end

  def set(canvas = %{style: style}, :bold) do
    %{canvas | style: Bitwise.bor(style, @bold)}
  end

  def set(canvas = %{style: style}, :dimmed) do
    %{canvas | style: Bitwise.bor(style, @dimmed)}
  end

  def set(canvas = %{style: style}, :inverse) do
    %{canvas | style: Bitwise.bor(style, @inverse)}
  end

  def reset(canvas = %{style: style}, :normal) do
    style = Bitwise.band(style, Bitwise.bnot(@bold))
    style = Bitwise.band(style, Bitwise.bnot(@dimmed))
    %{canvas | style: style}
  end

  def reset(canvas = %{style: style}, :inverse) do
    %{canvas | style: Bitwise.band(style, @inverse)}
  end

  def write(canvas, chardata) do
    %{
      data: data,
      cursor_x: x,
      cursor_y: y,
      foreground: fg,
      background: bg,
      style: style,
      width: width
    } = canvas

    {data, x, y} =
      chardata
      |> IO.chardata_to_string()
      |> String.to_charlist()
      |> Enum.reduce({data, x, y}, fn c, {data, x, y} ->
        x = rem(x + 1, width)
        y = y + div(x + 1, width)
        data = Map.put(data, {x, y}, {c, fg, bg, style})
        {data, x, y}
      end)

    %{canvas | data: data, cursor_x: x, cursor_y: y}
  end

  def diff(buf1, buf2) do
    %{
      data: data1,
      height: height,
      width: width,
      cursor: cursor1
    } = buf1

    %{
      data: data2,
      height: ^height,
      width: ^width,
      cursor_x: x2,
      cursor_y: y2,
      cursor: cursor2
    } = buf2

    {list, _, x, y} =
      for row <- 0..height, col <- 0..width, reduce: {[], nil, 0, 0} do
        {list, cel0, x, y} ->
          cel1 = Map.get(data1, {row, col}, {' ', @white, @black, 0})
          cel2 = Map.get(data2, {row, col}, {' ', @white, @black, 0})

          case cel1 == cel2 do
            true ->
              {list, cel0, x, y}

            false ->
              {_, b0, f0, s0} = cel0
              {c2, b2, f2, s2} = cel2

              list =
                case {x, y} == {col, row} do
                  true -> list
                  false -> [{:m, col, row} | list]
                end

              list =
                case b0 == b2 do
                  true -> list
                  false -> [{:b, b2} | list]
                end

              list =
                case f0 == f2 do
                  true -> list
                  false -> [{:f, f2} | list]
                end

              list =
                case s0 == s2 do
                  true -> list
                  false -> [{:s, s0, s2} | list]
                end

              # to update styles write c2 even if same to c1
              list =
                case list do
                  [{:d, d} | tail] -> [{:d, [d, c2]} | tail]
                  _ -> [{:d, c2} | list]
                end

              col = rem(col + 1, width)
              row = div(col + 1, width)
              {list, cel2, col + 1, row}
          end
      end

    list =
      case {x, y} == {x2, y2} do
        true -> list
        false -> [{:m, x2, y2} | list]
      end

    list =
      case cursor1 == cursor2 do
        true -> list
        false -> [{:c, cursor2} | list]
      end

    list
  end

  def encode(term, list) do
    list = :lists.reverse(list)
    list = encode(term, [], list)
    :lists.reverse(list)
  end

  defp encode(_, list, []), do: list

  defp encode(term, list, [{:m, x, y} | tail]) do
    d = term.cursor(x, y)
    encode(term, [d | list], tail)
  end

  defp encode(term, list, [{:d, d} | tail]) do
    d = IO.chardata_to_string(d)
    encode(term, [d | list], tail)
  end

  defp encode(term, list, [{:s, s1, s2} | tail]) do
    b1 = Bitwise.band(s1, @bold)
    b2 = Bitwise.band(s2, @bold)
    d1 = Bitwise.band(s1, @dimmed)
    d2 = Bitwise.band(s2, @dimmed)
    i1 = Bitwise.band(s1, @inverse)
    i2 = Bitwise.band(s2, @inverse)

    list =
      case {b1, b2, d1, d2} do
        {@bold, 0, _, @dimmed} -> [term.reset(:normal), term.set(:dimmed) | list]
        {_, @bold, @dimmed, 0} -> [term.reset(:normal), term.set(:bold) | list]
        {@bold, 0, _, _} -> [term.reset(:normal) | list]
        {_, _, @dimmed, 0} -> [term.reset(:normal) | list]
        {0, @bold, _, _} -> [term.set(:bold) | list]
        {_, _, 0, @dimmed} -> [term.set(:dimmed) | list]
        _ -> list
      end

    list =
      case {i1, i2} do
        {0, @inverse} -> [term.set(:inverse) | list]
        {@inverse, 0} -> [term.reset(:inverse) | list]
        _ -> list
      end

    encode(term, list, tail)
  end

  defp encode(term, list, [{:b, b} | tail]) do
    d = term.color(:background, b)
    encode(term, [d | list], tail)
  end

  defp encode(term, list, [{:f, f} | tail]) do
    d = term.color(:foreground, f)
    encode(term, [d | list], tail)
  end

  defp encode(term, list, [{:c, c} | tail]) do
    d =
      case c do
        true -> term.show(:cursor)
        false -> term.hide(:cursor)
      end

    encode(term, [d | list], tail)
  end

  defp num(id) do
    case id do
      :black -> @black
      :red -> @red
      :green -> @green
      :yellow -> @yellow
      :blue -> @blue
      :magenta -> @magenta
      :cyan -> @cyan
      :white -> @white
      _ -> id
    end
  end
end
