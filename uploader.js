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
        },
        SID, SCORE, NAME;

    // Prevent newlines from turning to Canvas Errors
    str = str.trim();
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

    // TODO:
    // inspect csv.meta.truncated and csv.errors
    csvObj.data.forEach(function (lineData) {
        var sid, grade, name;

        sid = lineData[SID];
        grade = lineData[SCORE];
        name = lineData[NAME];

        result.names[`${opts['user_id_format']}:${sid}`] = name;
        result.scores[`${opts['user_id_format']}:${sid}`] = grade;
    });

    return result;
}


module.exports = function postGrades (options, data, callback) {
    var course, gradesData, url;
    
    course = new Canvas(
        options.url,
        { token: options.token }
    );

    gradesData = parseCSV(options, data);

    url = uploadURL(options.course_id, options.assignment_id);

    bulkGradeUpload(course, url, gradesData, callback);
};


/**
    Return the URL for a bulk upload of grades to a canvas assignment.
*/
function uploadURL(course, assignment) {
    return `courses/${course}/assignments/${assignment}/submissions/update_grades`;
}


/**
    This posts multiple grades to a single assignment at once.
    Grades should be of the form: { sid: grade }
    Note, bCourses is whacky and updates grades in an async manner:

 **/
function bulkGradeUpload(course, url, data, cb) {
    var form = {};

    for (sid in data.scores) {
        form[`grade_data[${sid}][posted_grade]`] = data.scores[sid];
    }

    // This returns a canvas "progress" object
    course.post(url, {}, form, function(error, resp, body) {
        if (error || !body || body.errors) {
            cb('Uh, oh! An error occurred');
            cb(error);
            cb(body.errors || 'No error message...');
            return;
        }
        cb('Course Updates Posted');
        cb(`URL ${body.url}`);

        monitorProgress(course, body.id, cb);
    });
};

// Progress Object Docs
// https://bcourses.berkeley.edu/doc/api/progress.html
// the state of the job one of 'queued', 'running', 'completed', 'failed'
function monitorProgress(course, id, callback) {
    var timeoutID, delay = 500,
        prevCompletion = null, prevState = null;

    // Use a small delay to prevent killing any servers
    // since the progress API leaves no choice other than polling.
    setTimeout(function() {
        course.get(`progress/${id}/`, {}, function(err, resp, body) {
            if (err || !body || body.errors) {
                callback('Error!');
            } else {
                if (body.workflow_state == 'completed' || body.workflow_state === 'failed') {
                    // callback('Error! Upload Failed');
                    callback('Done!');
                    if (body.message) {
                        callback(`\t${body.message}`);
                    }
                    return;
                }
                if (body.completion !== prevCompletion ||
                        body.workflow_state !== prevState) {
                    if (body.completion) {
                        callback(`Progress ${body.completion}%`);
                    }
                    if (body.message) {
                        callback(`\t${body.message}`);
                    }
                    prevState = body.state;
                    prevCompletion = body.completion;
                } else {
                    callback(`Canvas State: ${body.workflow_state}`);
                }
                monitorProgress(course, id, callback);
            }
        });
    }, delay);
}
