#!/bin/bash -xe

#tio /dev/ttyUSB0
#./native.sh build linux-arm

cd firmware

export MIX_ENV=dev
export MIX_TARGET=bbb

mix firmware

#defaults to nerves.local
mix upload athasha.local

#burn SD card first time only
#mix burn --task upgrade

#Application.ensure_all_started :athasha
#Nerves.Runtime.reboot

#Athasha.Release.migrate
#Application.ensure_all_started :athasha
