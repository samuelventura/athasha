#!/bin/bash -xe

#tio /dev/ttyUSB0

#http://athasha.local/
#https://athasha.local/

COMMAND="${1:-build}"

case $COMMAND in
    client) #once only
        (cd frontend && yarn)
        (cd frontend && yarn build)
        rsync -avr frontend/dist/ backend/priv/client
    ;;
    native) #once only
        ./native.sh clean
        ./native.sh build linux-arm
    ;;
    build)
        cd firmware

        export MIX_ENV=dev
        export MIX_TARGET=bbb_icu

        mix firmware

        #defaults to nerves.local
        #ping athasha.local
        #ping athasha-4199.local
        #ping 10.77.4.240
        mix upload athasha.local
    ;;
    upload)
        cd firmware

        export MIX_ENV=dev
        export MIX_TARGET=bbb_icu
        mix upload athasha.local
    ;;
esac

#burn SD card first time only
#mix burn --task upgrade

#Application.ensure_all_started :athasha
#Nerves.Runtime.reboot

#Athasha.Release.migrate
#Application.ensure_all_started :athasha

#from https://hexdocs.pm/nerves/customizing-systems.html
#see https://github.com/samuelventura/nerves_system_bbb_emmc/blob/main/Howto.txt
#git clone https://github.com/nerves-project/nerves_system_bbb.git nerves_system_bbb_icu -b v2.14.0
#cd nerves_system_bbb_icu
#mix deps.get
#mix nerves.system.shell 
#make menuconfig (requires libncurses-dev)
#Target packages -> Libraries -> Text and terminal handling -> icu
#make savedefconfig
#make (takes long)
#exit
#mix nerves.artifact (after updating @app and @github_organization)
#cp nerves_system_bbb_icu-portable-2.14.0-54BA3ED.tar.gz ~/.nerves/artifacts
