

# Sample Config file

Name this config file as `.enuploader` and put it next by your `package.json` file.
```
module.exports = {
  "buildFolder": "build", // the build folder to update
  "enPageId": "56093",

  "syncFolder": {
    "doUpdate": false,
    "host": "127.0.0.1",
    "protocol": "ftp", // sftp or ftp
    "port": 21,
    "username": "up",
    "password": "theup",
    "remoteDir": "/2020/uploader/56093"
  },
  "en": {
    "doUpdate": true,
    "enPageId": 56093, // the target page id on the en
    "username": "up.chen@greenpeace.org",
    "password": "",
    "account": "Greenpeace Taiwan" // Greenpeace Taiwan, Greenpeace Korea, Greenpeace Hong Kong
  }
}
```

# Install LFTP
@see https://www.npmjs.com/package/ftps


Windows (Chocolatey)

```
C:\> choco install lftp
```

OSX (Homebrew)
```
sudo brew install lftp
```

Linux
```
sudo apt-get install lftp
# or
sudo yum install lftp
```

# Download Selenium Driver

@see https://www.npmjs.com/package/selenium-webdriver

Put the `chromedriver` next to your `package.json` file.