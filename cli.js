#!/usr/bin/env node
const path = require('path');

// console.log('process.argv', process.argv)
// console.log(add(Number(process.argv[2]), Number(process.argv[3])))

var workingDir = process.cwd()
var settings = require(path.join(workingDir, ".enuploader"));
const buildFolderPath = path.join(workingDir, settings.buildFolder)
const emailPath = settings.emailFile ? path.join(workingDir, settings.emailFile) : null
// console.log('settings', settings)

if (settings.syncFolder.doUpdate) {
	const upload_folder = require('./upload_folder.js')
	upload_folder(
		settings.syncFolder,
		buildFolderPath,
		settings.syncFolder.remoteDir)
}


const handle_en = require('./handle_en.js')
handle_en({
	settings: settings.en,
	buildDir: buildFolderPath,
	emailPath: emailPath
})