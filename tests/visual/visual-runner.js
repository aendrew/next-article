"use strict";

require('es6-promise').polyfill();

var moment = require('moment');
var normalizeName = require('next-build-tools/lib/normalize-name');
var exec = require('next-build-tools/lib/exec');
var packageJson = require('../../package.json');

var fs = require('fs');
var denodeify = require('denodeify');
var writeFile = denodeify(fs.writeFile);
var deployStatic = require('next-build-tools').deployStatic;
var GitHubApi = require('github');
var github = new GitHubApi({ version: "3.0.0", debug: false });
var createComment = denodeify(github.issues.createComment);

var LOCAL_PREFIX = "tests/visual/screenshots/";
var AWS_DEST_PREFIX = "image_diffs/" + normalizeName(packageJson.name, { version: false }) + "/" + moment().format('YYYY-MM-DD') + "/" + moment().format('HH:mm') + "-" + process.env.TRAVIS_BUILD_NUMBER + "/";
var AWS_SHOTS_INDEX = "https://s3-eu-west-1.amazonaws.com/ft-next-qa/" + AWS_DEST_PREFIX + "successes/index.html";
var AWS_FAILS_INDEX = "https://s3-eu-west-1.amazonaws.com/ft-next-qa/" + AWS_DEST_PREFIX + "failures/index.html";

console.log("Running image diff tests");

return exec("casperjs test tests/visual/elements-test.js", { env: { TEST_HOST: process.env.TEST_HOST } })
	.then(function(result) {
		var results = {};
		var promises = [];
		console.log("\n\nCasperJS output: \n\n" + result);

		if (fs.existsSync(LOCAL_PREFIX + "successes")) {

			// find all screenshots and build an html page to display them
			results.screenshots = fs.readdirSync(LOCAL_PREFIX + "successes");
			var screenshotspage = buildIndexPage(results.screenshots);
			promises.push(writeFile(LOCAL_PREFIX + "successes/index.html", screenshotspage));

			// add path to screenshots
			results.screenshots = results.screenshots.map(function(screenshot) { return "successes/" + screenshot; });
			console.log("Screenshots located at " + AWS_SHOTS_INDEX);
		} else {
			console.log("No screenshots here");
		}

		if (fs.existsSync(LOCAL_PREFIX + "failures")) {
			results.failures = fs.readdirSync(LOCAL_PREFIX + "failures");
			var failurespage = buildIndexPage(results.failures);
			promises.push(writeFile(LOCAL_PREFIX + "failures/index.html", failurespage));

			// add path to failures
			results.failures = results.failures.map(function(failure) { return "failures/" + failure; });
			console.log("Failure screenshots located at " + AWS_FAILS_INDEX);
		} else {
			console.log("No failures found");
		}

		return Promise.all(promises)
			.then(function() { return results; });
	})
	.then(function(results) {
		var files = ["successes/index.html"]
			.concat(results.screenshots);

		if (results.failures) {
			files = files
				.concat(results.failures)
				.concat(["failures/index.html"]);
		}

		return deployStatic({
			files: files.map(function(file) { return LOCAL_PREFIX + "" + file; }),
			destination: AWS_DEST_PREFIX,
			region: 'eu-west-1',
			bucket: 'ft-next-qa',
			strip: 3
		}).
			then(function() { return results; });
	})

	// Make a comment if a changed has been detected and it's a PR build
	.then(function(results) {
		var pullRequest = process.env.TRAVIS_PULL_REQUEST;
		var repoSlug = process.env.TRAVIS_REPO_SLUG.split('/');

		if (pullRequest !== "false" && results.failures !== undefined) {
			github.authenticate({ type: "oauth", token: process.env.GITHUB_OAUTH });
			return createComment({
					user: repoSlug[0],
					repo: repoSlug[1],
					number: pullRequest,
					body: "[Image diffs found between branch and production](" + AWS_FAILS_INDEX + ")"
				});
		} else {
			console.log("No comments to make to Pull Request");
		}
	})
	.then(function() {
		console.log("finished visual regression tests");
		process.exit(0);
	})
	.catch(function(err) {
		console.log("there was an error");
		console.log(err.stack);
		process.exit(1);
	});

function buildIndexPage(screenshots) {
	var html = "<html><body>";
	for (var j = 0; j < screenshots.length; j++) {
		if (screenshots[j].indexOf("base.png") !== -1) {
			var matchingshot = screenshots[j].replace("base.png", "test.png");
			html += "<p>" + screenshots[j] + "</p>" +
			'<p><p></p></p><img src="' + screenshots[j] + '">' + "</p>";
			html += "<p>" + matchingshot + "</p>" +
			'<p><p></p><img src="' + matchingshot + '">' + "</p>";
		}
		if (screenshots[j].indexOf("fail.png") !== -1){
			html += "<p>" + screenshots[j] + "</p>" +
			'<p><p></p></p><img src="' + screenshots[j] + '">' + "</p>";
		}
	}
	html += "</body></html>";
	return html;
}
