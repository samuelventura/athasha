@echo off
SETLOCAL EnableDelayedExpansion
set /p password="Enter Password: "
cd %~dp0
echo !password! > "athasha.config.pwd"
call athasha\bin\athasha.bat rpc "Athasha.Auth.logout"