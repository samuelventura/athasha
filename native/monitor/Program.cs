using System;
using System.ServiceProcess;
using System.Runtime.Versioning;

[SupportedOSPlatform("windows")]
class Program
{
    static void Main(string[] args)
    {
        if (Environment.UserInteractive)
        {
            Task.Run(Monitor);
            while (Console.ReadLine()!=null);
        }
        else
        {
            ServiceBase.Run(new Monitor(Monitor));
        }
    }

    static void Log(string format, params object[] args) 
    {
         if (Environment.UserInteractive)
        {
            if (args.Length > 0) {
                format = string.Format(format, args);
            }
            Console.WriteLine("{0} {1}", DateTime.Now, format);
        }        
    }

    static void Monitor() {
        var seconds = 0;
        var service = null as ServiceController;
        while(true)
        {
            try {
                if (service == null) {
                    service = Find();
                } else {
                    service.Refresh();
                }
                if (service != null) {
                    if (service.Status == ServiceControllerStatus.Stopped) {
                        service.Start();
                    } else {
                        Log("Running...");
                    }
                }
            } catch(Exception ex) {
                Log(ex.ToString());
            } finally {
                seconds++;
                if (seconds > 60) seconds=60;
                Thread.Sleep(1000 * seconds);
            }
        }
    }

    static ServiceController Find() {
        foreach (var service in ServiceController.GetServices())    
        {    
            if (service.DisplayName == "athasha_athasha") {
                return service;
            }
        } 
        return null;
    }
}

[SupportedOSPlatform("windows")]
class Monitor : ServiceBase
{
    public static readonly string NAME = "AthashaMonitor";
    private Action action;

    public Monitor(Action action)
    {
        this.action = action;
        this.ServiceName = NAME;
    }

    protected override void OnStart(string[] args)
    {
        base.OnStart(args);

        Task.Run(action);
    }

    protected override void OnStop()
    {
        base.OnStop();
    }
}
