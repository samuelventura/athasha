namespace SharpTools;

public class Global
{
    public static void Catch(Action<Exception> handler)
    {
        AppDomain.CurrentDomain.UnhandledException += (s, e) => { handler(e.ExceptionObject as Exception); };
    }
}
