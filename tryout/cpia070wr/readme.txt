mix nerves.new . --app comfile
#replace nerves by comfile in config/target.exs

export MIX_TARGET=rpi3
mix firware
mix burn #first time
mix upload comfile.local #works!
