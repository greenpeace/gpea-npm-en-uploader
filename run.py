#!/usr/bin/python3
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from ftplib import FTP
import platform
import os
import re
import time
import logging
import sys

from config import config
logging.basicConfig(stream=sys.stdout, level=logging.WARN)
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
CHROME_DRIVER_PATH = os.path.join(BASE_DIR, 'chromedriver')

def get_os_control_key():
	"""Cross-platfform support for ctrl+a"""
	os_base = platform.system()
	if os_base=="Darwin":
		return Keys.COMMAND
	return Keys.CONTROL

def recursive_upload_folder(ftp, path):
	"""Recursively upload the path to remote FTP current path

	Args:
		ftp {ftplib} Python native ftp module which is loggined and switch to the target destination
		path {string} The base path to upload. Should be a folder path.
	"""
	files = os.listdir(path)
	os.chdir(path)
	for f in files:
		this_path = os.path.join(path, f)
		if os.path.isfile(this_path):
			logger.debug("Uploading %s" % this_path)
			fh = open(this_path, 'rb')
			ftp.storbinary('STOR %s' % f, fh)
			fh.close()
		elif os.path.isdir(this_path):
			logger.debug("Uploading %s" % this_path)
			if f not in ftp.nlst():
				ftp.mkd(f)
			ftp.cwd(f)
			recursive_upload_folder(ftp, os.path.join(path, f))
	ftp.cwd('..')
	os.chdir('..')

def upload_folder_to_ftp(ftp_config, src, dst):
	"""Upload the src folder to the remote dst folder

	Args:
		ftp_config.host {string}
		ftp_config.port {int}
		ftp_config.user {string}
		ftp_config.password {string}
		src {string} The folder path to sync from at local machine
		dst {string} The folder path to sync to at FTP server. Remember you should create the dst folder first.
	"""
	print('upload_folder_to_ftp')
	logger.info("Uploading files to FTP %s:%d, src:%s, dst:%s" % (ftp_config["host"], ftp_config["port"], src, dst))

	ftp = FTP()
	ftp.connect(ftp_config["host"], ftp_config["port"])
	logger.info(ftp.login(ftp_config["user"], ftp_config["password"]))
	logger.debug(ftp.getwelcome())
	ftp.cwd(dst) # change to the target base folder
	recursive_upload_folder(ftp, src) # now call the recursive function

	logger.info("Upload finished. Now logout FTP.")
	ftp.quit()


def update_en(en_config, target_page_url, build_path):
	"""Update the header/footer to en page.

	Args:
		en_config.user {string} The account to login en
		en_config.password {string} The account to login en
		target_page_url {string} The en edit url of target page. ex. https://www.e-activist.com/index.html#pages/54302/edit
		build_path {string} The dir path to build folder. The build/index.html is required.
	"""
	# fetch build contents
	logger.debug("Reading index.html to get header and footer")
	content = None
	index_html_path = os.path.join(build_path, 'index.html')
	with open(index_html_path, 'r') as file:
		content = file.read().replace('\n', '')

	matches = re.search('(.*)(<form.*form>)(.*)', content, re.IGNORECASE)
	header = footer = None
	if matches:
		header = matches.group(1)
		footer = matches.group(3)
	else:
		raise Exception("Cannot find the header and footer in file %s" % index_html_path)

	logger.info("Updating to Engaging Network %s" % (target_page_url))
	options = Options()
	driver = webdriver.Chrome(CHROME_DRIVER_PATH)
	# driver = webdriver.Firefox()
	driver.get(target_page_url)

	# wait login window to show
	logger.debug("Wait the login window to show")
	WebDriverWait(driver, 30).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#enLoginUsername")))

	logger.debug("Exec Login")
	logger.info("Login Engaging Network with account:%s" % (en_config["user"]))
	username = driver.find_element_by_id("enLoginUsername")
	password = driver.find_element_by_id("enLoginPassword")

	username.send_keys(en_config["user"])
	password.send_keys(en_config["password"])
	driver.find_element_by_css_selector('.button.button--login').click()

	logger.debug("Waiting the editing screen to show")
	el = WebDriverWait(driver, 30).until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".pboPB__button.pboPB__button--template")))
	WebDriverWait(driver, 30).until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, ".enOverlay--pboPageBuilder .messageOverlay.loading")))
	el.click()

	logger.debug("Waiting the editor to show up")
	WebDriverWait(driver, 30).until(EC.visibility_of_element_located((By.CSS_SELECTOR, ".pboTemplate__editor")))

	logger.debug("Updating Header Content")
	el = driver.find_element(By.CSS_SELECTOR, ".pboTemplate__editor--header")
	el.click()
	el = driver.find_element(By.CSS_SELECTOR, ".pboTemplate__editor--header textarea")
	el.send_keys(get_os_control_key() + 'a')
	el.send_keys(Keys.BACKSPACE)
	el.send_keys(header)

	el.send_keys(get_os_control_key() + Keys.SHIFT + Keys.DOWN) # clear the auto complete
	el.send_keys(Keys.BACKSPACE)

	logger.debug("Updating Footer Content")
	el = driver.find_element(By.CSS_SELECTOR, ".pboTemplate__editor--footer")
	el.click()
	el = driver.find_element(By.CSS_SELECTOR, ".pboTemplate__editor--footer textarea")
	el.send_keys(get_os_control_key() + 'a')
	el.send_keys(Keys.BACKSPACE)
	el.send_keys(footer)

	el.send_keys(get_os_control_key() + Keys.SHIFT + Keys.DOWN)
	el.send_keys(Keys.BACKSPACE)

	logger.debug("Save the content")
	WebDriverWait(driver, 30).until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, ".enOverlay--pboPageBuilder .messageOverlay.loading")))
	driver.find_element(By.CSS_SELECTOR, ".enOverlay--pboTemplate--edit .button--save").click()


	logger.debug("Waiting the confirm window")
	el = WebDriverWait(driver, 30).until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".enOverlay--pboCheckInUse .pboCheckInUse__action--save")))
	el.click()
	time.sleep(3)

	WebDriverWait(driver, 30).until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, ".enOverlay--pboPageBuilder .messageOverlay.loading")))
	el = WebDriverWait(driver, 30).until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".enOverlay--pboPageBuilder .button--done")))
	el.click()

	WebDriverWait(driver, 30).until_not(EC.visibility_of_element_located((By.CSS_SELECTOR, ".enOverlay--pboPageBuilder .messageOverlay.loading")))
	el = WebDriverWait(driver, 30).until(EC.element_to_be_clickable((By.CSS_SELECTOR, ".enOverlay--pboValidation .pboValidation__action--ok")))
	el.click()

	logger.info("Successfully update en.")
	time.sleep(3)
	driver.quit()

def main():
	if not os.path.isdir(config["build_path"]):
		raise	Exception("build folder is not exist")

	if config["ftp"]["do_update"]:
		upload_folder_to_ftp(config["ftp"], config["build_path"], config["ftp"]["remote_dir"])

	if config["en"]["do_update"]:
		update_en(config["en"], config["en"]["target_page"], config["build_path"])

	logger.info("All Done.")

if __name__=="__main__":
	main()
