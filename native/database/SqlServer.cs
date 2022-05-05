using System;
using System.Text.Json;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;

public class SqlServerDatabase : Database
{
    private SqlConnection conn;

    public SqlServerDatabase(string connstr)
    {
        conn = new SqlConnection(connstr);
        conn.Open();
    }

    public override void Dispose()
    {
        conn.Dispose();
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

    public override void ExecDatabase(DatabaseDto dto)
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
            case "float":
                return je.GetDouble();
            case "integer":
                return je.GetInt64();
            case "string":
                return je.GetString();
            default:
                throw new Exception("Unknown param type");
        }
    }
}
