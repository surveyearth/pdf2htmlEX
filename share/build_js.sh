#!/bin/sh -ex
# Compile and optimize JS code
# Copyright 2013 Lu Wang <coolwanglu@gmail.com>

# To enable closure-compiler, you need to install and configure JAVA environment
# Read 3rdparty/closure-compiler/README for details


BASEDIR=$(dirname $0)
INPUT="$BASEDIR/pdf2htmlEX.js"
OUTPUT_FN="pdf2htmlEX.min.js"
OUTPUT="$BASEDIR/$OUTPUT_FN"

echo "Building $OUTPUT_FN with closure-compiler..."
closure-compiler \
     --compilation_level SIMPLE_OPTIMIZATIONS \
     --warning_level VERBOSE \
     --output_wrapper "(function(){%output%})();" \
     --js "$INPUT" \
     --js_output_file "$OUTPUT"
echo 'Done.'
