// Upload a CSV of Grades to Canvas
// CSV: requires a student ID and a grade

var Canvas = require('node-canvas-lms');
var Papa = require('papaparse');

/**
 *  parseCSV -- returns a mapping of SID:Grade
 *  TODO: Would student names be helpful for debugging?
 *  Probably, but makes data passing messy...
 */
function parseCSV(opts, str) {
    var csvObj,
        result = {
            names: {},
            scores: {}
        };

    // Options: http://papaparse.com/docs#config
    csvObj = Papa.parse(str, {
        header: true,
        skipEmptyLines: true
    });

    // Must exactly match the CSV first row!
    // TODO: modify names to make optparse format
    // TODO: then document
    SCORE = 'Total Score' || opts.headers.gradeCol;
    NAME = 'Name' || opts.headers.nameCol;
    SID = 'SID'  || opts.headers.sidCol;
    
    csvObj.forEach(function (lineData) {
        var sid, grade, name;
        sid = lineData[SID];
        grade = lineData[SCORE];
        name = lineData[NAME];
        
        result.names[sid] = name;
        result.scores[sid] = grade;   
    });
    
    return result;
}


module.exports = function postGrades (options, data, callback) {
    var course, gradesData;
    course = new Canvas(
        options.url,
        {
            token: options.token
        }
    );
    
    gradesData = parseCSV(opts, data);
    
    
};



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

