#!/bin/bash -xe

# for ubuntu/debian
# assumes asdf already installed

sudo apt install dos2unix

asdf plugin add yarn
asdf plugin add dotnet
asdf plugin add nodejs
asdf plugin add elixir
asdf plugin add erlang

asdf install

./release.sh build
./native.sh build

cd backend
mix deps.get
mix compile
mix ecto.reset
iex -S mix phx.server

# go to
# https://localhost:4001/
