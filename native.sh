#!/bin/bash -xe

COMMAND="${1:-build}"
case "$OSTYPE" in
  darwin*)  
    TARGET=osx-arm64
    PUBLISH="bin/Release/net6.0/$TARGET/publish/"
    ;;
  linux*)   
    TARGET=linux-x64
    PUBLISH="bin/Release/net6.0/$TARGET/publish/"
    ;;
  *)        
    TARGET=win10-x64 
    PUBLISH="bin/X64/Release/net6.0/$TARGET/publish/"
    ;;
esac

TARGET="${2:-${TARGET}}"

#rsync -avr  native/ports/priv/dotnet/ /c/Athasha/athasha/lib/ports-0.1.0/priv/dotnet
case $COMMAND in
    build)
    (cd native/serial && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/database && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/identity && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/monitor && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/perms && dotnet publish -c Release -r $TARGET --self-contained true)
    mkdir -p native/ports/priv
    rsync -avr native/serial/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/database/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/identity/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/monitor/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/perms/$PUBLISH native/ports/priv/dotnet
    ;;
    test)
      (cd native/modbus && ./test.sh)
    ;;
    clean)
        rm -fr native/ports/priv/dotnet
        rm -fr native/serial/bin
        rm -fr native/serial/obj
        rm -fr native/database/bin
        rm -fr native/database/obj
        rm -fr native/identity/bin
        rm -fr native/identity/obj
        rm -fr native/monitor/bin
        rm -fr native/monitor/obj
        rm -fr native/perms/bin
        rm -fr native/perms/obj
    ;;
esac
