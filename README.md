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
	$ grade-uploader
	usage: grade-uploader [-h] [-v] -c COURSE_ID -a ASSIGNMENT_ID -f FILE [-u URL] -t TOKEN [-uid {"",sis_login_id,sis_user_id}]
	```
	```
	$ grade-uploader -t ABCED...123 -c 1268501 -a 7148451 -f ~/Desktop/Midterm_scores.csv
	```
	* When using the command line, you can optionally define `CANVAS_TOKEN` in your environment. This will be used if no `-t` option is provided.
	* e.g. `export CANVAS_TOKEN='ABCEDF...'`

2. As a module:
	```
	var postGrades = require('canvas-grade-uploader');

	postGrades(options, data, callback); // See below for options
	```

**NOTE** The module interface is currently a work in progress. Breaking changes to this interface will be semver-minor, at least until it's fully stable.

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
Canvas authenticates users with OAuth Tokens. You can generate a token for yourself by visiting your personal settings page. There is Canvas [documentation][docs] about generating your own token.

The short version is: Visit this page.
`https:/<canvas-instance>/profile/settings`

[docs]: https://guides.instructure.com/m/4214/l/40399-how-do-i-obtain-an-api-access-token-for-an-account

## CSV Format
This tool was built to speed up working with [Gradescope](https://gradescope.com)

The CSV file requires the following values:

* "SID" -- This is the unique user ID for each student.
* "Total Score" -- This is the score that each user will receive.
* Optional "Name" -- The name column currently isn't used, but might be for debugging in the future. (Really, it's much much nicer to deal with names over IDs when possible.)

## Default Values
Currently, there are a couple default values which as "Berkeley-specific". If this tool gets enough use, I'll gladly change them…

* URL, `-u` defaults to: `https://bcourses.berkeley.edu`
* User ID format, `-sid` defaults to: `sis_user_id`. This parameter controls how Canvas interprets user IDs. See [this][sid-id].

(In the future, I'd consider supporting some means of having user-default parameters, so please submit a PR if you'd like!)

[sid-id]: http://bjc.link/canvassisid

## Programatic Options and Callback Formats
Using this as a module requires 3 parameters:

* `options`: A JS object, with keys that mirror the command line arguments. _Note_: in this form, the only defaults that are applied are the CSV column names. The file parameter is not required.
	```
	{
	  course_id: '1268501',
	  assignment_id: '7148451',
	  url: 'https://bcourses.berkeley.edu/',
	  token: '<token>',
	  user_id_format: 'sis_user_id'
	}
	```
* `data`: This is the CSV data, as a string.
* `callback`: This is called with a string, updating the progress of uploading grades. Note that it will be called quite a few times in the process uploading grades.
	* **WARNING** This will be updated to have a signature like `(err, resp)` very soon.


## Tips
* If you want to test things, use `http://<domain>.beta.instructure.com/`
	* Instructure's beta instances have a separate DB that is supposed to be purged and refreshed every few weeks.
	* (This only applies if you're using a hosted Canvas instance.)

