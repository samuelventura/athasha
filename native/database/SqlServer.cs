using System;
using System.Text.Json;
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

    public override void Execute(ExecuteDto dto)
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
