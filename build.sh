#!/bin/sh
#
# requer usuário com privilégios de root
#

workdir=$(dirname $0)/
version=$(cat $workdir/src/DEBIAN/control | grep Version | cut -d" " -f2)

source=$(realpath ${workdir}/src)
target=$(realpath ${workdir}/target/mark-browser-${version}-all.deb)

echo [info]Gerando pacote MarkBrowser ${version}
echo [info]Alvo: ${target}
echo [info]Ativando privilégios de root

sudo dpkg-deb --build $source $target
chown $(whoami) -R $workdir --quiet

echo [info]Feito!
