namespace SharpTools;

public class CatchAll
{
    public static void Setup(Action<Exception> handler)
    {
        AppDomain.CurrentDomain.UnhandledException += (s, e) => { handler(e.ExceptionObject as Exception); };
    }
}
