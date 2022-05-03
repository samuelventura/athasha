using System;
using System.Text.Json;
using SharpTools;
CatchAll.Setup((e) =>
{
    Console.Error.WriteLine("{0}", e);
    Environment.Exit(1);
});
var dbtype = args[0];
var connstr = Console.ReadLine();
if (connstr == null) return;
var db = new Database();
switch (dbtype)
{
    case "sqlserver":
        db = new SqlServerDatabase(connstr);
        break;
    case "sqlite":
        db = new SqliteDatabase(connstr);
        break;
    default:
        throw new Exception("Unknown dbtype");
}
using (db)
{
    using (var stdin = Console.OpenStandardInput())
    {
        using (var stdout = Console.OpenStandardOutput())
        {
            while (true)
            {
                var data = Stdio.Read(stdin);
                if (data == null) return;
                var cmd = (char)data[0];
                switch (cmd)
                {
                    case 'i':
                        {

                            break;
                        }
                    default:
                        throw new Exception("Unknown command");
                }
            }
        }
    }
}
