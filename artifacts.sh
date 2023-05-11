#!/bin/bash -xe

if [[ "$OSTYPE" == "linux"* ]]; then
    rsync -rav build:'~/.nerves/dl/nerves_system_*.tar.gz' ~/.nerves/dl/
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    rsync -rav build.quick:'~/.nerves/dl/nerves_system_*.tar.gz' ~/.nerves/dl/
fi
