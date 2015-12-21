# Canvas Grade Uploader

A simple tool to handle grade uploading to [Canvas], a learning management system.

[Canvas]: http://instructure.com

## Usage
There are two use cases:

1. Command line tool:
```
grade-uploader [leave blank for short help]
usage: grade-uploader [-h] [-v] -c COURSE_ID -a ASSIGNMENT_ID [-u URL] -t TOKEN
              [-uid {"",sis_login_id,sis_user_id}]
              grades-csv
```
```
grade-uploader -t [token] -c 1268501 -a 7148451 ~/Desktop/Midterm_scores.csv
```
2. As a module:
```
var postGrades = require('canvas-grade-uploader');

postGrades(options, data, callback); // See below for options
```

**NOTE** The module interface is currently a work in progress.

## Configuration



## CSV Format
