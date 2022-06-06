using System;
using System.Text.Json;
using System.Text;
using Microsoft.Data.Sqlite;
using SharpTools;
Global.Catch((ex) =>
{
    Console.Error.WriteLine("{0}", ex);
    Environment.Exit(1);
});
var dbpath = args[0];

var sql_create = "create table trend (dt INTEGER, input TEXT, value REAL)";
var sql_index_dt = "create index trend_dt on trend (dt)";
var sql_index_input = "create index trend_input on trend (input)";
var sql_insert = "insert into trend (dt, input, value) values ($dt, $input, $value)";
var sql_clean = "delete from trend where input = $input and dt < $dt";
var sql_select = "select dt, value from trend where input = $input";

using (var stdin = Console.OpenStandardInput())
{
    using (var stdout = Console.OpenStandardOutput())
    {
        var stdio = new Stdio.H4(stdin, stdout);
        var encoder = new UTF8Encoding();
        var exists = File.Exists(dbpath);
        using (var conn = new SqliteConnection($"Data Source={dbpath}"))
        {
            try
            {
                conn.Open();
                if (!exists)
                {
                    using (var cmd = new SqliteCommand(sql_create, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                    using (var cmd = new SqliteCommand(sql_index_dt, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                    using (var cmd = new SqliteCommand(sql_index_input, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }
                stdio.WriteString("ok");
                while (true)
                {
                    var data = stdio.Read();
                    if (data == null) return;
                    var cmd = (char)data[0];
                    switch (cmd)
                    {
                        case 's': //select
                            {
                                var json = encoder.GetString(data, 1, data.Length - 1);
                                var dto = JsonSerializer.Deserialize<SelectDto>(json);
                                using (var dbcmd = new SqliteCommand(sql_clean, conn))
                                {
                                    dbcmd.Parameters.AddWithValue("$dt", dto.first);
                                    dbcmd.Parameters.AddWithValue("$input", dto.input);
                                    dbcmd.ExecuteNonQuery();
                                }
                                using (var dbcmd = new SqliteCommand(sql_select, conn))
                                {
                                    dbcmd.Parameters.AddWithValue("$input", dto.input);
                                    using (var reader = dbcmd.ExecuteReader())
                                    {
                                        var keys = new List<long>();
                                        var values = new List<double>();
                                        while (reader.Read())
                                        {
                                            var dt = reader.GetInt64(0);
                                            var value = reader.GetDouble(1);
                                            keys.Add(dt);
                                            values.Add(value);
                                        }
                                        var resp = JsonSerializer.Serialize(new { keys, values });
                                        stdio.WriteString("ok");
                                        stdio.WriteString(resp);
                                    }
                                }
                                break;
                            }
                        case 'i': //insert
                            {
                                var json = encoder.GetString(data, 1, data.Length - 1);
                                var dto = JsonSerializer.Deserialize<InsertDto>(json);
                                using (var dbcmd = new SqliteCommand(sql_insert, conn))
                                {
                                    dbcmd.Parameters.AddWithValue("$dt", dto.dt);
                                    dbcmd.Parameters.AddWithValue("$input", dto.input);
                                    dbcmd.Parameters.AddWithValue("$value", dto.value);
                                    dbcmd.ExecuteNonQuery();
                                }
                                using (var dbcmd = new SqliteCommand(sql_clean, conn))
                                {
                                    dbcmd.Parameters.AddWithValue("$dt", dto.first);
                                    dbcmd.Parameters.AddWithValue("$input", dto.input);
                                    dbcmd.ExecuteNonQuery();
                                }
                                stdio.WriteString("ok");
                                break;
                            }
                        default:
                            throw new Exception("Unknown command");
                    }
                }
            }
            catch (Exception ex) { stdio.WriteString("ex:" + ex.Message); throw; }
        }
    }
}
public class InsertDto
{
    public long dt { get; set; }
    public long first { get; set; }
    public string input { get; set; }
    public double value { get; set; }
}
public class SelectDto
{
    public long first { get; set; }
    public string input { get; set; }
}
