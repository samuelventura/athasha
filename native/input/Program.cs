var prompt = args[0];
var trimmed = bool.Parse(args[1]);
var hidden = bool.Parse(args[2]);
var file = args[3];
Console.Write(prompt);
var input = string.Empty;
if (hidden) {
    while (true)
    {
        var keyInfo = Console.ReadKey(intercept: true);
        var key = keyInfo.Key;
        if (key == ConsoleKey.Backspace && input.Length > 0)
        {
            Console.Write("\b \b");
            input = input[0..^1];
        }
        else if (!char.IsControl(keyInfo.KeyChar))
        {
            Console.Write("*");
            input += keyInfo.KeyChar;
        }
        if (key == ConsoleKey.Enter) break;
    }
}
else 
{
    input = Console.ReadLine();
    if (input == null) return;
}
if (trimmed) { input = input.Trim(); }
File.WriteAllText(file, input);
