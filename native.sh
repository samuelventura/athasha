#!/bin/bash -xe

COMMAND="${1:-build}"

case "$OSTYPE" in
  darwin*)  TARGET=osx-arm64 ;; 
  linux*)   TARGET=linux-x64 ;;
  *)        TARGET=win10-x64 ;;
esac

TARGET="${2:-${TARGET}}"

#rsync -avr  native/ports/priv/dotnet/ /c/Athasha/athasha/lib/ports-0.1.0/priv/dotnet
case $COMMAND in
    build)
    (cd native/serial && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/database && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/identity && dotnet publish -c Release -r $TARGET --self-contained true)
    (cd native/perms && dotnet publish -c Release -r $TARGET --self-contained true)
    mkdir -p native/ports/priv
    rsync -avr native/serial/bin/X64/Release/net6.0/$TARGET/publish/ native/ports/priv/dotnet
    rsync -avr native/database/bin/X64/Release/net6.0/$TARGET/publish/ native/ports/priv/dotnet
    rsync -avr native/identity/bin/X64/Release/net6.0/$TARGET/publish/ native/ports/priv/dotnet
    rsync -avr native/perms/bin/X64/Release/net6.0/$TARGET/publish/ native/ports/priv/dotnet
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
        rm -fr native/perms/bin
        rm -fr native/perms/obj
    ;;
esac
