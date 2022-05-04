#!/bin/bash -xe

COMMAND="${1:-build}"

case "$OSTYPE" in
  darwin*)  TARGET=osx-arm64 ;; 
  linux*)   TARGET=linux-x64 ;;
  *)        TARGET=win10-x64 ;;
esac

TARGET="${2:-${TARGET}}"

case $COMMAND in
    build)
    (cd native/serial && dotnet publish -r $TARGET --self-contained)
    (cd native/database && dotnet publish -r $TARGET --self-contained)
    (cd native/identity && dotnet publish -r $TARGET --self-contained)
    mkdir -p native/ports/priv
    rsync -avr native/serial/bin/Debug/net6.0/$TARGET/publish/ native/ports/priv/dotnet
    rsync -avr native/database/bin/Debug/net6.0/$TARGET/publish/ native/ports/priv/dotnet
    rsync -avr native/identity/bin/Debug/net6.0/$TARGET/publish/ native/ports/priv/dotnet
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
    ;;
esac
