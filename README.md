
# gpea-npm-en-uploader

As webbie in TW and HK, we build the donation page or petition page on the Engaging Network all the time. While we are building and testing, we have to manually upload all our files to FTP and update the template HTML on the Engaging Network. It isn't enjoyable to do these steps.

So I build this tools, it helps you deploy your code happily and confidently. The main feature is:

1. Upload all the `build` folder to FTP or SFTP.
2. Automatically update the HTML on the EN.

    * Extract the header and footer from `build/index.html`.
    * Patch the `v=12345` with version code over all the `index.html` file.
    * Update the header and footer part of the target en page.

3. Automatically update the `email.html` as Thank you email.

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

#### Create the config file

Next by your `package.json` file, create a file `.enuploader` with following content

```
module.exports = {
	"buildFolder": "build", // the build folder to update
	"emailFile": "path/to/email.html", // the email template file to upload to en. or null
	"enPageId": 55747, // the target page id on the en

	"syncFolder": {
		"doUpdate": true, // false if you don't need to upload your build folder.
		"protocol": "sftp", // ftp or sftp
		"port": 22, // 21 or 22
		"host": "change.greenpeace.org.tw", // "ftp.greenpeace.org.hk",
		"username": "",
		"password": "",
		"remoteDir": "/path/to/remote/folder"
	},
	"en": {
		"doUpdate": true, // false if you don't want to update to en
		"enPageId": 55747,
		"username": "", // your en username
		"password": "",
		"account": "Greenpeace Taiwan" // Greenpeace Taiwan, Greenpeace Korea, Greenpeace Hong Kong
	}
}
```

# Run

At your project root folder, run

```
yarn deploy
```


# Note

* Do NOT commit `.enuploader` file into git since there's password inside it.

# TODOs

* Update the social share attributes.
* Refine the setting files. Maybe we can put the password in other safe spaces.
