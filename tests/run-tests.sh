#! /bin/sh


# This is connected to a personal test course, you should likely create your
# own test file, token should be set in token.sh
FILENAME=$0
DIR=$(dirname ${FILENAME})
cd $DIR
source token.sh
../cli.js -c 1268501 -a 7148481 \
    -f ./Mock_Final_scores.csv \
    --url https://bcourses.berkeley.edu \
    -sid 'sis_login_id'