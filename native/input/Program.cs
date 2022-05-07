var prompt = args[0];
var trimmed = bool.Parse(args[1]);
var file = args[2];
Console.Write(prompt);
var input = Console.ReadLine();
if (input == null) return;
if (trimmed) { input = input.Trim(); }
File.WriteAllText(file, input);
