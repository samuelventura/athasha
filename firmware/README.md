# AthashaFirmware

mkdir firmware
cd firmware
mix nerves.new . --app athasha_firmware
MIX_TARGET=rpi4 mix deps.get
MIX_TARGET=rpi4 mix compile
MIX_TARGET=rpi4 mix firmware
MIX_TARGET=rpi4 mix firmware.image
MIX_TARGET=rpi4 mix upload athasha-4ad8.local
ssh athasha-4ad8.local
ssh 172.31.255.9

