using System;
using System.Text.Json;
using System.Text;
using SharpTools;
Global.Catch((ex) =>
{
    Console.Error.WriteLine("{0}", ex);
    Environment.Exit(1);
});
var dbtype = args[0];
using (var stdin = Console.OpenStandardInput())
{
    using (var stdout = Console.OpenStandardOutput())
    {
        var encoder = new UTF8Encoding();
        var connstr = Stdio.ReadString(stdin);
        if (connstr == null) return;
        using (var db = Database.Factory(dbtype, connstr))
        {
            while (true)
            {
                var data = Stdio.Read(stdin);
                if (data == null) return;
                var cmd = (char)data[0];
                switch (cmd)
                {
                    case 'x':
                        {
                            var json = encoder.GetString(data, 1, data.Length - 1);
                            var dto = JsonSerializer.Deserialize<ExecuteDto>(json);
                            db.Execute(dto);
                            break;
                        }
                    default:
                        throw new Exception("Unknown command");
                }
            }
        }
    }
}
public class ExecuteDto
{
    public string command { get; set; }
    public ParamDto[] parameters { get; set; }
}
public class ParamDto
{
    public string type { get; set; }
    public object value { get; set; }
}
