using System;
using System.Text.Json;
using Microsoft.Data.SqlClient;

public class SqlServerDatabase : Database
{
    private string connstr;
    private SqlConnection conn;

    public SqlServerDatabase(string connstr)
    {
        this.connstr = connstr;
    }

    public override void Connect()
    {
        conn = new SqlConnection(connstr);
        conn.Open();
    }

    public override void Dispose()
    {
        if (conn != null) conn.Dispose();
    }

    public override string ExecDataplot(DataplotDto dto)
    {
        using (var cmd = new SqlCommand(dto.command, conn))
        {
            cmd.Parameters.AddWithValue("@FROM", dto.fromDate.ToLocalTime());
            cmd.Parameters.AddWithValue("@TO", dto.toDate.ToLocalTime());
            using (var reader = cmd.ExecuteReader())
            {
                var list = new List<object[]>();
                //number of seconds in one hour = 3600
                while (reader.Read() && list.Count < 3600)
                {
                    var values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    list.Add(values);
                }
                return JsonSerializer.Serialize(list);
            }
        }
    }

    public override string ExecDatafetch(DatafetchDto dto)
    {
        using (var cmd = new SqlCommand(dto.command, conn))
        {
            using (var reader = cmd.ExecuteReader())
            {
                var list = new List<object[]>();
                while (reader.Read() && list.Count < 1)
                {
                    var values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    list.Add(values);
                }
                return JsonSerializer.Serialize(list);
            }
        }
    }

    public override void ExecDatalog(DatalogDto dto)
    {
        using (var cmd = new SqlCommand(dto.command, conn))
        {
            for (int i = 0; i < dto.parameters.Length; i++)
            {
                var name = $"@{i + 1}";
                var value = GetValue(dto.parameters[i]);
                cmd.Parameters.AddWithValue(name, value);
            }
            cmd.ExecuteNonQuery();
        }
    }

    public object GetValue(ParamDto dto)
    {
        var je = (JsonElement)dto.value;
        switch (dto.type)
        {
            case "float": //tested with Opto22 analog
                return je.GetDouble();
            case "integer": //tested with booleans
                return je.GetInt64();
            case "decimal": //tested with Laurel Item 1
                return je.GetString();
            default:
                throw new Exception("Unknown param type");
        }
    }
}
