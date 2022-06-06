#!/bin/bash -xe

COMMAND="${1:-build}"

case "$OSTYPE" in
  darwin*)  
    case `uname -m` in
      arm64) TARGET=osx-arm64 ;;
      *)     TARGET=osx-x64 ;;
    esac
  ;; 
  linux*)   TARGET=linux-x64 ;;
  *)        TARGET=win10-x64 ;;
esac

TARGET="${2:-${TARGET}}"

case "$OSTYPE" in
  darwin*)  
    PUBLISH="bin/Release/net6.0/$TARGET/publish/"
    ;;
  linux*)   
    PUBLISH="bin/Release/net6.0/$TARGET/publish/"
    ;;
  *)        
    PUBLISH="bin/X64/Release/net6.0/$TARGET/publish/"
    ;;
esac

# in osx with dotnet 6.0.300
# warning NETSDK1179: One of '--self-contained' or '--no-self-contained' options are required when '--runtime' is used.
OPTIONS="--configuration Release --runtime $TARGET --self-contained true"
case $COMMAND in
    build)
    (cd native/serial && dotnet publish $OPTIONS)
    (cd native/screen && dotnet publish $OPTIONS)
    (cd native/database && dotnet publish $OPTIONS)
    (cd native/identity && dotnet publish $OPTIONS)
    (cd native/monitor && dotnet publish $OPTIONS)
    (cd native/input && dotnet publish $OPTIONS)
    (cd native/perms && dotnet publish $OPTIONS)
    mkdir -p native/ports/priv
    rsync -avr native/serial/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/screen/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/database/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/identity/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/monitor/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/input/$PUBLISH native/ports/priv/dotnet
    rsync -avr native/perms/$PUBLISH native/ports/priv/dotnet
    ;;
    test)
      (cd native/modbus && ./test.sh)
    ;;
    clean)
        rm -fr native/ports/priv/dotnet
        rm -fr native/serial/bin
        rm -fr native/serial/obj
        rm -fr native/screen/bin
        rm -fr native/screen/obj
        rm -fr native/database/bin
        rm -fr native/database/obj
        rm -fr native/identity/bin
        rm -fr native/identity/obj
        rm -fr native/monitor/bin
        rm -fr native/monitor/obj
        rm -fr native/input/bin
        rm -fr native/input/obj
        rm -fr native/perms/bin
        rm -fr native/perms/obj
    ;;
esac
