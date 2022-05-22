using System;

public class Database : IDisposable
{
    public static Database Factory(string dbtype, string connstr)
    {
        switch (dbtype)
        {
            case "sqlserver":
                return new SqlServerDatabase(connstr);
            case "sqlite":
                return new SqliteDatabase(connstr);
            default:
                throw new Exception("Unknown dbtype");
        }
    }

    public Database() { }
    public virtual void Connect() { }
    public virtual void Dispose() { }
    public virtual string ExecDataplot(DataplotDto dto) { return null; }
    public virtual string ExecDatafetch(DatafetchDto dto) { return null; }
    public virtual void ExecDatalog(DatalogDto dto) { }
}
