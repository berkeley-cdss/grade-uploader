# Canvas Grade Uploader

A simple tool to handle grade uploading to [Canvas], a learning management system.

[Canvas]: http://instructure.com

## Installation
The grade uploader works well as a command line tool. If you're using it this way be sure to use the `-g` option:
```
npm install -g canvas-grade-uploader
```


## Usage
There are two use cases:

1. Command line tool:
	```
	grade-uploader [leave blank for short help]
	usage: grade-uploader [-h] [-v] -c COURSE_ID -a ASSIGNMENT_ID -f FILE [-u URL] -t
              TOKEN [-uid {"",sis_login_id,sis_user_id}]
	```
	```
	grade-uploader -t [token] -c 1268501 -a 7148451 -f ~/Desktop/Midterm_scores.csv
	```
2. As a module:
	```
	var postGrades = require('canvas-grade-uploader');

	postGrades(options, data, callback); // See below for options
	```

**NOTE** The module interface is currently a work in progress.

## Configuration
The grade uploader uploads grades to a specific Canvas assignment. To do this a few details are required. The command line help will walk you through most of them.

Canvas assignment and course IDs are easily obtained from the URL of the assignments page.

For example:
```
https://bcourses.berkeley.edu/courses/1268501/assignments/7148451
```

* URL: `https://bcourses.berkeley.edu/`
* Course ID: `1268501`
* Assignment ID: `7148451`

### Getting a Canvas Token
Canvas authenticates users with Oauth Tokens. You can generate a token for yourself by visiting your personal settings page. There is Canvas [documentation][docs] about generating your own token.

The short version is: Visit this page.
`https:/<canvas-instance>/profile/settings`

[docs]: https://guides.instructure.com/m/4214/l/40399-how-do-i-obtain-an-api-access-token-for-an-account

## CSV Format
This tool was built to speed up working with [Gradescope](https://gradescope.com)

The CSV file requires the following values:

* SID
* Total Score

## Default Values

## Options and Callback Formats

## Tips