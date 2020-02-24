const path = require('path')
const fs = require('fs');
const os = require('os');

// read in the secret variables from user's homefolder
let raw = fs.readFileSync(path.join(os.homedir(), ".npm-en-uploader-secret"));
let secrets = JSON.parse(raw);

// the target en pageId
const enPageId = 56257

// build folder path
const buildDirPath = path.join(__dirname, "build")

module.exports = {
	ftp: Object.assign({}, secrets["ftp_tw"], {
		execute: true,
		"localDir": buildDirPath,
		"remoteDir": "/htdocs/2020/petition/zh-tw.2020.climate.taipower",
	}),

	enBase: Object.assign({}, secrets["en"], {
		enPageId: enPageId,
		"account": "Greenpeace Taiwan" // change this if you have multi acconts
	}),

	enHeaderFooter: {
		execute: true,
		enPageId: enPageId,
		indexPath: path.join(buildDirPath, 'index.html')
	},

	enThankYouEmail: {
		execute: true,
		enPageId: enPageId,
		mailPath: "src/ThankyouEmail.html",
	}
}
