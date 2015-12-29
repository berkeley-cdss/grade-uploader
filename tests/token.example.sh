#! /bin/sh

# create a new file "token.sh", that looks just like this one.

# use this check to allow setting a token in another method, if desired.
# a good use for this might be intrgrating with Travis.
if [[ -z "$CANVAS_TOKEN" ]]; then
    export CANVAS_TOKEN="mytoken"
fi