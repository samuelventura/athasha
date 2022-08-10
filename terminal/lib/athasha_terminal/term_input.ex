defmodule AthashaTerminal.Input do
  @behaviour AthashaTerminal.Window
  alias AthashaTerminal.Canvas
  alias AthashaTerminal.Theme

  def init(opts) do
    text = Keyword.get(opts, :text, "")
    size = Keyword.get(opts, :size, {String.length(text), 1})
    focused = Keyword.get(opts, :focused, false)
    enabled = Keyword.get(opts, :enabled, true)
    theme = Keyword.get(opts, :theme, :default)
    cursor = Keyword.get(opts, :cursor, String.length(text))
    origin = Keyword.get(opts, :origin, {0, 0})
    findex = Keyword.get(opts, :findex, 0)
    password = Keyword.get(opts, :password, false)

    %{
      focused: focused,
      cursor: cursor,
      findex: findex,
      enabled: enabled,
      password: password,
      theme: theme,
      text: text,
      size: size,
      origin: origin
    }
  end

  def update(state, :text, text), do: %{state | text: text, cursor: String.length(text)}
  def update(state, name, value), do: Map.put(state, name, value)
  def select(%{origin: {x, y}, size: {w, h}}, :bounds, _), do: {x, y, w, h}
  def select(%{findex: findex, enabled: enabled}, :focusable, _), do: findex >= 0 && enabled
  def select(state, name, value), do: Map.get(state, name, value)

  def handle(state, {:key, _, "\t"}), do: {state, {:focus, :next}}
  def handle(state, {:key, _, "\r"}), do: {state, {:focus, :next}}

  def handle(%{cursor: cursor} = state, {:key, _, :arrow_left}) do
    cursor = if cursor > 0, do: cursor - 1, else: cursor
    state = %{state | cursor: cursor}
    {state, nil}
  end

  def handle(%{cursor: cursor, text: text} = state, {:key, _, :arrow_right}) do
    count = String.length(text)
    cursor = if cursor < count, do: cursor + 1, else: cursor
    state = %{state | cursor: cursor}
    {state, nil}
  end

  def handle(state, {:key, _, :home}) do
    state = %{state | cursor: 0}
    {state, nil}
  end

  def handle(%{text: text} = state, {:key, _, :end}) do
    count = String.length(text)
    state = %{state | cursor: count}
    {state, nil}
  end

  def handle(%{cursor: cursor, text: text} = state, {:key, _, :backspace}) do
    {prefix, suffix} = String.split_at(text, cursor)

    {prefix, cursor} =
      case cursor do
        0 ->
          {prefix, cursor}

        _ ->
          {prefix, _} = String.split_at(prefix, cursor - 1)
          {prefix, cursor - 1}
      end

    text = "#{prefix}#{suffix}"
    state = %{state | text: text, cursor: cursor}
    {state, nil}
  end

  def handle(%{cursor: cursor, text: text} = state, {:key, _, :delete}) do
    {prefix, suffix} = String.split_at(text, cursor)
    suffix = String.slice(suffix, 1..String.length(suffix))
    text = "#{prefix}#{suffix}"
    state = %{state | text: text}
    {state, nil}
  end

  def handle(%{cursor: cursor, text: text} = state, {:key, 0, data}) when is_binary(data) do
    %{size: {width, _}} = state
    count = String.length(text)

    state =
      case count do
        ^width ->
          state

        _ ->
          {prefix, suffix} = String.split_at(text, cursor)
          text = "#{prefix}#{data}#{suffix}"
          %{state | text: text, cursor: cursor + 1}
      end

    {state, nil}
  end

  def handle(state, _event), do: {state, nil}

  def render(state, canvas) do
    %{
      focused: focused,
      theme: theme,
      cursor: cursor,
      enabled: enabled,
      password: password,
      size: {width, _},
      text: text
    } = state

    theme = Theme.get(theme)
    canvas = Canvas.clear(canvas, :colors)

    canvas =
      case {enabled, focused} do
        {false, _} ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_disabled)
          Canvas.color(canvas, :bgcolor, theme.back_disabled)

        {true, true} ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_focused)
          Canvas.color(canvas, :bgcolor, theme.back_focused)

        _ ->
          canvas = Canvas.color(canvas, :fgcolor, theme.fore_editable)
          Canvas.color(canvas, :bgcolor, theme.back_editable)
      end

    text =
      case password do
        false -> text
        true -> String.duplicate("*", String.length(text))
      end

    text = String.pad_trailing(text, width)
    canvas = Canvas.move(canvas, 0, 0)
    canvas = Canvas.write(canvas, text)

    case {focused, enabled, cursor < width} do
      {true, true, true} ->
        Canvas.cursor(canvas, cursor, 0)

      _ ->
        canvas
    end
  end
end
