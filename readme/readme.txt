#erlang
brew install autoconf openssl@1.1 wxwidgets libxslt fop
#nerves
brew install fwup squashfs coreutils xz pkg-config 
#yarn
brew install gnupg 

git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.10.2

#~/.zshrc
. $HOME/.asdf/asdf.sh

asdf plugin add erlang
asdf plugin add elixir
asdf plugin add nodejs
asdf plugin add dotnet-core
asdf plugin add yarn
asdf install

mix local.hex
mix local.rebar

mix archive.install hex phx_new
mix archive.install hex nerves_bootstrap

mix local.nerves
mix local.phx

#erlang jinterface (not working)
asdf plugin add java
asdf install java openjdk-18.0.1.1
asdf global java openjdk-18.0.1.1
. ~/.asdf/plugins/java/set-java-home.zsh

#ex_termbox (not needed anymore)
asdf plugin add python 
asdf install python 3.10.5
asdf local python 3.10.5

cd frontend
yarn dev --host

cd cloud
yarn dev

./native.sh
cd backend
iex -S mix phx.server
