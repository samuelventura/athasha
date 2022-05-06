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
        var stdio = new Stdio.H4(stdin, stdout);
        var encoder = new UTF8Encoding();
        var connstr = stdio.ReadString();
        if (connstr == null) return;
        using (var db = Database.Factory(dbtype, connstr))
        {
            while (true)
            {
                var data = stdio.Read();
                if (data == null) return;
                var cmd = (char)data[0];
                switch (cmd)
                {
                    case 'b': //database
                        {
                            var json = encoder.GetString(data, 1, data.Length - 1);
                            var dto = JsonSerializer.Deserialize<DatabaseDto>(json);
                            db.ExecDatabase(dto);
                            break;
                        }
                    case 'p': //dataplot
                        {
                            var json = encoder.GetString(data, 1, data.Length - 1);
                            var dto = JsonSerializer.Deserialize<DataplotDto>(json);
                            var resp = db.ExecDataplot(dto);
                            stdio.WriteString(resp);
                            break;
                        }
                    default:
                        throw new Exception("Unknown command");
                }
            }
        }
    }
}
public class DataplotDto
{
    public string command { get; set; }
    public DateTime fromDate { get; set; }
    public DateTime toDate { get; set; }
}
public class DatabaseDto
{
    public string command { get; set; }
    public ParamDto[] parameters { get; set; }
}
public class ParamDto
{
    public string type { get; set; }
    public object value { get; set; }
}
