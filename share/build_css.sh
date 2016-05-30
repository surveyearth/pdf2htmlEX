#!/bin/sh -ex
# Compile and optimize CSS code
# Copyright 2013 Lu Wang <coolwanglu@gmail.com>


BASEDIR=$(dirname $0)

build () {
    INPUT="$BASEDIR/$1"
    OUTPUT="$BASEDIR/$2"
    echo "Building $OUTPUT with YUI Compressor"
    yui-compressor --type css --charset utf-8 -o "$OUTPUT" "$INPUT"
    echo 'Done.'
}

build "base.css" "base.min.css"
build "fancy.css" "fancy.min.css"
