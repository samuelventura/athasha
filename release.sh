#!/bin/bash -xe

COMMAND="${1:-build}"

case $COMMAND in
    build)
        (cd frontend && yarn)
        (cd frontend && yarn build)
        (cd backend && mix deps.get --only prod)
        (cd backend && MIX_ENV=prod mix compile)
        (cd backend && MIX_ENV=prod mix assets.deploy)
        (dos2unix backend/_build/prod/lib/athasha/priv/athasha.pub)
        #requires dev dependencies
        #(cd backend && mix phx.gen.release)
        rsync -avr frontend/dist/ backend/priv/client
        (cd backend && MIX_ENV=prod mix release --overwrite)
        #builds ok from msys terminal but must be launch from cmd because
        #msys complains erts-12.3.2/bin/erlexec: No such file or directory
        #backend\_build\prod\rel\athasha\bin\athasha.bat eval "Athasha.Release.migrate"
        #backend\_build\prod\rel\athasha\bin\athasha.bat start
        #backend\_build\prod\rel\athasha\bin\athasha.bat remote
        #Application.fetch_env!(:athasha, AthashaWeb.Endpoint)
        #Application.fetch_env!(:athasha, Athasha.Repo)
    ;;
    clean)
        rm -fr frontend/node_modules
        rm -fr frontend/dist
        rm -fr backend/deps
        rm -fr backend/_build
        rm -fr backend/priv/client
        rm -fr backend/priv/static/assets/*
        rm -fr backend/priv/static/cache_manifest.json
        rm -fr backend/priv/static/robots-*.*
        rm -fr backend/priv/static/favicon-*.*
        rm -fr backend/priv/static/images/phoenix-*.*
        rm -fr backend/priv/static/*.gz
        #git reset --hard
    ;;
esac
