#!/bin/bash -xe

VERSION="${1:-0.0.0}"

signtool sign //fd sha256 //tr http://ts.ssl.com //a setup/Athasha-${VERSION}.exe
rsync -av setup/Athasha-${VERSION}.exe athasha.io:.athasha/download/
