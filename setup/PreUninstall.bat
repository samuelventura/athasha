cd %~dp0
if exist athasha\ (
    sc stop "AthashaMonitor"
    sc delete "AthashaMonitor" 
    netsh advfirewall firewall delete rule name="Athasha.Web"
    netsh advfirewall firewall delete rule name="Athasha.Backend"
    athasha\erts-12.3.2\bin\erlsrv.exe stop athasha_athasha
    athasha\erts-12.3.2\bin\erlsrv.exe remove athasha_athasha
)
