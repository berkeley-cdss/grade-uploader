# `./grade-uploader`

## v1.1 December 27, 2015
* Created CHANGELOG
* Rename `-uid` to `-sid`, and switch references of `--user*` to `--student`
	* This is to make things more consistent with Canvas API terms.
* Call `trim()` when parsing CSVs. (Prevent trying to submit an empty line as a grade)


## v1.0.3 December 20, 2015
* Code Cleanup and documentation improvements

## v1.0.2 December 21, 2015
* Immediate fix of not testing v1.0.1 properly...

## v1.0.1 December 21, 2015
* Add `-f` and `--file` to specify the CSV file.

## v1.0.0 December 21, 2015
* Initial Release to npm
* Basic functionality, CLI and package API all work.
