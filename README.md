
# gpea-npm-en-uploader

As webbie in TW and HK, we build the donation page or petition page on the Engaging Network all the time. While we are building and testing, we have to manually upload all our files to FTP and update the template HTML on the Engaging Network. It isn't enjoyable to do these steps.

So I build this tools, it helps you deploy your code happily and confidently. The main feature is:

1. Upload all the `build` folder to FTP or SFTP.
2. Automatically update the HTML on the EN.

	* Extract the header and footer from `build/index.html`.
	* Patch the `v=12345` with version code over all the `index.html` file.
	* Update the header and footer part of the target en page.

3. Automatically update the `email.html` as Thank you email.

How it looks like:
![gpea-npm-en-uploader Demo](demo.gif)

## Installation

#### Install lftp

This script uses `lftp` to upload. You have to install it. (If you ask me why don't you use node version, the answer is all the `ssh2` based solution doesn't fit TW sftp. It just doesn't work!)


Windows (Chocolatey)

```
C:\> choco install lftp
```

OSX (Homebrew)
```
brew install lftp
```

Linux
```
sudo apt-get install lftp
# or
sudo yum install lftp
```

#### Download the Chrome driver

This script use `Selenium` to automate web things.

[Chrome Selenium Driver Download Link](https://www.npmjs.com/package/selenium-webdriver)

You have to download the Selenium `Chrome Webdriver`, which matches your OS and your Chrome version. Please put the `chromedriver` file next by your `package.json` file.

#### Install via npm

```
yarn add greenpeace/gpea-npm-en-uploader --dev
```

#### Add command into your `package.json` file

```
"scripts": {
	...
	"build:en": "PUBLIC_URL=https://your/ftp/path build",
	"deploy": "yarn run build:en && gpea-npm-en-uploader"
	...
},
```


# Create the secret file at your home folder

```
cd ~/
touch .npm-en-uploader-secret
chmod 600 .npm-en-uploader-secret
```

and update the content as following

```
{
	"en": {
		"username": "",
		"password": ""
	},

	"ftp_tw": {
		"host": "change.greenpeace.org.tw",
		"protocol": "sftp",
		"port": 22,
		"username": "",
		"password": ""
	},

	"ftp_hk": {
		"host": "ftp.greenpeace.org.hk",
		"protocol": "ftp",
		"port": 21,
		"username": "",
		"password": ""
	}
}
```


#### Create the config file

Next by your `package.json` file, create a file `.enuploader` with following content

```
const path = require('path')
const fs = require('fs');
const os = require('os');

// read in the secret variables from user's homefolder
let raw = fs.readFileSync(path.join(os.homedir(), ".npm-en-uploader-secret"));
let secrets = JSON.parse(raw);

// the target en pageId
const enPageId = 56257 // EDIT_HERE

// build folder path
const buildDirPath = path.join(__dirname, "build")

module.exports = {
	ftp: Object.assign({}, secrets["ftp_tw"], { // EDIT_HERE: Which ftp site you want to use
		"execute": true,
		"localDir": buildDirPath,
		"remoteDir": "/htdocs/2020/petition/zh-tw.2020.climate.taipower", // EDIT_HERE
	}),

	enBase: Object.assign({}, secrets["en"], {
		"enPageId": enPageId,
		"account": "Greenpeace Taiwan" // EDIT_HERE: change this if you have multi acconts
	}),

	enHeaderFooter: {
		"execute": true,
		"enPageId": enPageId,
		"indexPath": path.join(buildDirPath, 'index.html') // EDIT_HERE: the path to your build/index.html file
	},

	enThankYouEmail: {
		"execute": true,
		"enPageId": enPageId,
		"mailPath": "src/ThankyouEmail.html", // EDIT_HERE: the path to your email template
	}
}

```



# Run

At your project root folder, run

```
yarn deploy
```


# Note

* Please keep your secret file .npm-en-uploader-secret safe since it contains the real secrets.

# TODOs

* Update the social share attributes.
* Refine the setting files. Maybe we can put the password in other safe spaces.
