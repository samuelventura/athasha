cd %~dp0
rem netsh advfirewall firewall show rule name="Athasha.Backend"
netsh advfirewall firewall add rule name="Athasha.Backend" dir=in action=allow program="%~dp0athasha\erts-12.3.2\bin\erl.exe" enable=yes
netsh advfirewall firewall add rule name="Athasha.Backend" dir=in action=allow program="%~dp0athasha\erts-12.3.2\bin\werl.exe" enable=yes
rem netsh advfirewall firewall show rule name="Athasha.Web"
netsh advfirewall firewall add rule name="Athasha.Web" dir=in action=allow protocol=TCP localport=54321
call athasha\bin\migrate.bat
call athasha\bin\athasha.bat install
athasha\erts-12.3.2\bin\erlsrv.exe enable athasha_athasha
athasha\erts-12.3.2\bin\erlsrv.exe start athasha_athasha
