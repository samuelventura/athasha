#!/bin/bash -xe

COMMAND="${1:-build}"

case $COMMAND in
    build)
        (cd frontend && yarn)
        (cd frontend && yarn build)
        (cd backend && mix deps.get --only prod)
        (cd backend && MIX_ENV=prod mix compile)
        (cd backend && MIX_ENV=prod mix assets.deploy)
        (cd backend && mix phx.gen.release)
        cp -fr frontend/dist/* backend/priv/static/assets/
        (cd backend && MIX_ENV=prod mix release)
    ;;
    clean)
        rm -fr frontend/node_modules
        rm -fr frontend/dist
        rm -fr backend/deps
        rm -fr backend/_build
        rm -fr backend/priv/static/assets/*
        rm -fr backend/priv/static/cache_manifest.json
        rm -fr backend/priv/static/robots-*.*
        rm -fr backend/priv/static/favicon-*.*
        rm -fr backend/priv/static/images/phoenix-*.*
        rm -fr backend/priv/static/*.gz
        #git reset --hard
    ;;
esac
