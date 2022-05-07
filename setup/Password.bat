@echo off
cd %~dp0
set file="%~dp0athasha.config.pwd"
athasha\lib\ports-0.1.0\priv\dotnet\input.exe Password: true %file%
call athasha\bin\athasha.bat rpc "Athasha.Auth.logout"
