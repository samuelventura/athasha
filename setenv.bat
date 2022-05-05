@echo off
rem Run with: cmd /K c:\Users\samuel\Desktop\athasha\setenv.bat
rem Does not work when launched with start from another cmd window
rem Launch from Windows start menu text box
call "C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\vcvarsall.bat" amd64
cd %~dp0
rem mingw64.ini enable MSYS2_PATH_TYPE=inherit
rem https://gist.github.com/coldfix/5a9decff7ebf0d14867eb0cdeb57bd22
C:\msys64\mingw64 /bin/bash -lc 'cd /c/Users/samuel/Desktop/athasha; export CHERE_INVOKING=1; exec bash --login -i'
rem From here run ./release.sh
exit
