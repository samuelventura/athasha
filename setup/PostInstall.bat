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
powershell -noprofile -command "Get-Acl -Path '%ProgramFiles%' | Set-Acl -Path %cd%"
rem athasha\lib\ports-0.1.0\priv\dotnet\perms %cd%
rem System.InvalidOperationException: The security identifier is not allowed to be the owner of this object.
rem powershell -noprofile -command "Get-Acl -Path '%ProgramFiles%' | Set-Acl -Path %cd%"
rem takeown /A /R /D Y /F %cd% > nul 2>&1
rem icacls %cd% /reset
rem icacls "%ProgramFiles%"
rem icacls %cd%
