#!/bin/sh -e

DIR="${1%/*}"/
PATTERN="${1#$DIR}"
DEST="$2"

[ -n "$1" ]
[ -n "$2" ]

find "$DIR" -name "$PATTERN" | while read fn; do
	dst="$DEST/${fn#$DIR}"
	#echo "$fn" '->' "$dst"
	mkdir -p "${dst%/*}"
	cp -dpv "$fn" "$dst"
done
