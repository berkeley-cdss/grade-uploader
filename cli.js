#! /usr/bin/env node

// Upload grades from Pandagrader to bCourses

var Canvas = require('node-canvas-lms');
var fs = require('fs');
var path = require('path');
var ArgumentParser = require('argparse').ArgumentParser;
var papa = require('papaparse');

// Handle Command Line Args
var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'This script uploads a CSV file to the specified Canvas course.',
  epilogue: 'THIS NEEDS TO BE WRITTEN...should describe process for getting a token.'
});

parser.addArgument(
    [ '-c', '--course-id' ],
    { 
        help: 'This is the Canvas ID of the course.',
        required: true
    }
);
parser.addArgument(
    [ '-a', '--assignment-id' ],
    {
        help: 'This is the Canvas ID of the assignment to post grades to.',
        required: true
    }
);
parser.addArgument(
    ['grades-csv'],
    {
        help: 'A CSV file of grades. It must include a "SID" column and a "grade" column.',
        positional: 1
    }
);
parser.addArgument(
    [ '-u', '--url' ],
    {
        help: 'Specify a URL of the Canvas instance to use.\n\tThis currently defaults to Berkeley bCourses.',
        defaultValue: 'https://bcourses.berkeley.edu',
        required: false
    }
);
parser.addArgument(
    [ '-t', '--token' ],
    {
        help: 'An API token is required to upload scores. Use this option or export CANVAS_TOKEN.',
        defaultValue: process.env.CANVAS_TOKEN,
        required: false
    }
);
parser.addArgument(
    [ '-uid', '--user-id-format' ],
    {
        // TODO: Un-Berkeley-ify this option
        help: 'Canvas SIS id format. This currently defaults to `sis_user_id` which is used at UC Berkeley.' +
        '\nThis controls what ID options Canvas uses to find a student.',
        defaultValue: 'sis_user_id',
        choices: [
            '""',
            'sis_login_id',
            'sis_user_id'
        ],
        required: false
    }
);


// Verify Args Exist
var ARG_VALS;

function verifyArgs() {
    ARG_VALS = parser.parseArgs();
    var errors = [];

    // This check is necessary because CANVAS_TOKEN could be undefied.
    if (!ARG_VALS.token) {
        errors.push('Please export the CANVAS_TOKEN variable or provide token with -t.');
    }

    if (errors.length) {
        console.error('The following errors occurred:');
        console.error('\t' + errors.join('\n\t'));
        parser.printHelp();
        process.exit(1);
    }
}

verifyArgs();

var grades, course, data;

// Specify encoding to return a string
grades = fs.readFileSync(ARG_VALS.grades_file, { encoding: 'utf8'});

course = new Canvas(ARG_VALS.url, { token: ARG_VALS.token } );

data = grades.split('\n');

// TODO: Use the papaparse library.
data = data.map(function(item) { return item.split(',') });

// Must exactly match the CSV first row!
var header = data[0];
var SCORE = 'Total Score';
var NAME  = 'Name';
var SID   = 'SID';

var scoreCol = header.indexOf(SCORE);
var nameCol  = header.indexOf(NAME);
var sidCol   = header.indexOf(SID);

// Now post the grades....
// TODO: The extenstion students need a mapping like for CS10 lab checkoffs.
function postGrade(name, sid, score, num) {
    var scoreForm      = 'submission[posted_grade]=' + score,
        submissionBase = '/courses/' + ARG_VALS.course +
                         '/assignments/' + ARG_VALS.assignments + '/submissions/',
        submissionPath = submissionBase + ARG_VALS.sid_type + ':',
        submissionALT  = submissionBase + 'sis_login_id:';

    // FIXME -- this is dumb.
    submissionPath += sid;
    submissionALT  += sid;

    course.put(submissionPath , '', scoreForm,
            callback(name, sid, score, i));

    // Access in SID and points in the callback
    function callback(name, sid, score, i) {
        if (! (i % 15)) {
            console.log('Progress: ' + i + ' grades posted.');
        }
        return function(error, response, body) {
            // TODO: Make an error function
            // Absence of a grade indicates an error.
            // WHY DONT I CHECK HEADERS THATS WHAT THEY ARE FOR
            if (error || !body || body.errors) {
                var errorMsg = 'Problem: SID: ' + sid + ' NAME: ' + name +
                                ' SCORE: ' + score;
                if (error) {
                    console.log(error);
                }
                // Well, shit... just report error
                if (body && body.errors && body.errors[0]) {
                    errorMsg += '\nERROR:\t' + body.errors[0].message;
                }
                errorMsg += '\n\t' + submissionPath;
                console.log(errorMsg);
                // course.put(submissionALT , '', scoreForm,
//                     loginCallback(name, sid, score));
            }
        };
    }

    // A modified call back for when sis_login_id is used
    // THese should really be condenced but I didn't want to figure
    // out a proper base case for a recursive callback...lazy....
    function loginCallback(name, sid, score) {
        return function(error, response, body) {
            var errorMsg = 'Problem: SID: ' + sid + ' NAME: ' + name +
                           ' SCORE: ' + score;
           if (error || !body || body.errors || !body.grade || body.grade != score) {
                console.log(error);
                if (body && body.errors && body.errors[0]) {
                    errorMsg += '\nERROR:\t' + body.errors[0].message;
                }
                errorMsg += '\n\t' + submissionPath;
                console.log(errorMsg);
            }
        };
    }
}


// Post grades; skip header file
console.log('Posting ' + (data.length - 1) + ' grades.');
for (var i = 1; i < data.length; i += 1) {
    student = data[i];
    postGrade(student[nameCol], student[sidCol], student[scoreCol], i);
}