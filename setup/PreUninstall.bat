cd %~dp0
if exist athasha\ (
    netsh advfirewall firewall delete rule name="Athasha.Web"
    netsh advfirewall firewall delete rule name="Athasha.Backend1"
    netsh advfirewall firewall delete rule name="Athasha.Backend2"
    netsh advfirewall firewall delete rule name="Athasha.Backend3"
    sc stop "AthashaMonitor"
    sc delete "AthashaMonitor" 
    athasha\erts-12.3.2\bin\erlsrv.exe stop athasha_athasha
    athasha\erts-12.3.2\bin\erlsrv.exe remove athasha_athasha
)
