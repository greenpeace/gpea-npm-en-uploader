# gpea-update-builds-to-en

This script upadte your `build` folder to Engaging Network.

It does following things:

1. Upload `build` folder to FTP site.
2. Read `build/index.html` and update header/footer part of specific page on Engaging Network.

# Setup

## Install dependencies
```
pip install -r requirements.txt
```

## Setup Chrome Driver
1. Please find your drive at [https://chromedriver.chromium.org/downloads](https://chromedriver.chromium.org/downloads).
2. Download the drive and put `chromedriver` next by this script.

## Setup login accounts and variables

```
cp config.sample.py config.py
```

Please update the ftp and en variables in the file `config.py`

# Run

Execute this script by

```
python run.py
```


# TODO

* Actually this script should be written in javascript. Thus we can integrate into npm command
* Update the thank you mail in en.
* Update the social shares in en.