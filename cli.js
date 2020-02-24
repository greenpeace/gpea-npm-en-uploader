#!/usr/bin/env node
const path = require('path');

var workingDir = process.cwd()
var settings = require(path.join(workingDir, ".enuploader"));

if (settings.ftp.execute) {
	const upload_folder = require('./upload_folder.js')
	upload_folder(
		settings.ftp,
		settings.ftp.localDir,
		settings.ftp.remoteDir)
}

if (settings.enHeaderFooter.execute || settings.enThankYouEmail.execute) {
	const handle_en = require('./handle_en.js')
	handle_en(settings)
}

