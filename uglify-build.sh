#!/bin/sh -v
#
# Uglify/compress watch face files in prep for building
#
find . -name \*~ -exec rm {} \;

rm -f app/index.js
/usr/local/lib/node_modules/uglify-es/bin/uglifyjs -c -m toplevel <app-index.js >app/index.js
#cp app-index.js app/index.js

rm -f app/clock.js
/usr/local/lib/node_modules/uglify-es/bin/uglifyjs -c -m toplevel <app-clock.js >app/clock.js

rm -f app/graph.js
/usr/local/lib/node_modules/uglify-es/bin/uglifyjs -c -m toplevel <app-graph.js >app/graph.js
#cp app-graph.js app/graph.js

rm -f common/utils.js
/usr/local/lib/node_modules/uglify-es/bin/uglifyjs -c -m toplevel <common-utils.js >common/utils.js

# Apparently, the latest fitbit build process can't seem to use a symlink here
rm -f companion/index.js
cp app-companion.js companion/index.js
