const path = require('path')
const fs = require('fs')
const {Builder, By, Key, until} = require('selenium-webdriver');
const sutils = require('./seleniumUtils.js')

const SHORT_WAIT = 5*1000
const LONG_WAIT = 30*1000

const sleep = sutils.sleep
const controlKey = sutils.controlKey

/**
 * Login to Engaging network
 *
 * @param  {WebDriver} driver
 * @param  {object} settings
 */
const enlogin = async function (driver, settings) {
	await driver.get(`https://www.e-activist.com/index.html`)

	while (true) {
		// username and password panel
		if (await sutils.findElementSafely(driver, "#enLoginUsername")) {
			console.info("Login to Engaging Network")
			await driver.findElement(By.css("#enLoginUsername")).sendKeys(settings.username)
			await driver.findElement(By.css("#enLoginPassword")).sendKeys(settings.password)
			await driver.findElement(By.css(".button.button--login")).click()
			await sleep(1500)
		}

		// select user panel
		if (await sutils.findElementSafely(driver, ".userInput--selectUser")) {
			await driver.findElement(By.css(".userInput--selectUser .chosen-container-single")).click()
			await sleep(200)
			await driver.findElement(By.css(".userInput--selectUser .chosen-drop input")).sendKeys(settings.account)
			await driver.findElement(By.css(".userInput--selectUser .chosen-results li")).click()
			await sleep(200)
			await driver.findElement(By.css(".enLogin__form--selectUser .button--login")).click()
			await sleep(1500)
		}

		if (await sutils.findElementSafely(driver, ".enDashboard__gadget__header")) {
			console.debug("Already in the root")
			break;
		}

		await sleep(1000)
	}
}

/**
 * Update the template header and footer content
 *
 * @param  {WebDriver} driver Selenium WebDriver
 * @param  {object} settings [description]
 * @param  {string} buildDir The dir path to the folder which contains the index.html file
 */
const enUpdateTmplHeaderFooter = async function (driver, settings, buildDir) {
	console.log("Start to upadte the header and footer")
	console.log("Fetching header and footer from build folder")

	let content = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
	let matches = content.match(/((.|[\r\n])*)(<form[^<]+en__component.*form>)((.|[\r\n])*)/)
	let header, footer
	if (matches) {
		header = matches[1]
		footer = matches[4]
	} else {
		throw new Error(`Cannot resolve header and footer from file ${path.join(buildDir, 'index.html')}`)
	}

	// open the edit URL
	await driver.get(`https://www.e-activist.com/index.html#pages/${settings.enPageId}/edit`);

	// p1: open the edit panel
	console.log("Waiting the editing panel")
	while (true) {
		await sutils.clickElementSafely(driver, ".pboPB__button.pboPB__button--template") // button to edit the tempalte header and footer
		await sutils.clickElementSafely(driver, ".pboPageBuilderLocked__actions .button--ok")

		found = await sutils.findElementSafely(driver, ".pboTemplate__editor--header")
		if (found) {
			await(1500)
			break;
		}

		await sleep(1000)
	}

	// p2: input the header and footer
	console.debug("Updating Header Content")
	await driver.findElement(By.css(".pboTemplate__editor--header")).click()

	el = await driver.findElement(By.css(".pboTemplate__editor--header textarea"))
	el.sendKeys(Key.chord(controlKey(), "a"))
	el.sendKeys(Key.DELETE)
	await sleep(500)


	let jscmd = `document.querySelector('.pboTemplate__editor--header .ace_text-input').value = ${JSON.stringify(header)}`
	driver.executeScript(jscmd);
	el.sendKeys(" ")

	console.debug("Updating Footer Content")
	await driver.findElement(By.css(".pboTemplate__editor--footer")).click()

	el = await driver.findElement(By.css(".pboTemplate__editor--footer textarea"))
	el.sendKeys(Key.chord(controlKey(), "a"))
	el.sendKeys(Key.DELETE)
	await sleep(500)

	jscmd = `document.querySelector('.pboTemplate__editor--footer .ace_text-input').value = ${JSON.stringify(footer)}`
	driver.executeScript(jscmd);
	el.sendKeys(" ")

	// p3: Click all the save button
	while (true) {
		let btns = [
			".enOverlay--pboCheckInUse .pboCheckInUse__action--save",
			".enOverlay--pboValidation .pboValidation__action--ok",
			".enOverlay__popup--pboTemplate--edit .button--save",
			".enOverlay__popup--pboPageBuilder .button--done"
		]

		for (let i=0; i<btns.length; i++) {
			await sutils.clickElementSafely(driver, btns[i])
		}

		found = await sutils.findElementSafely(driver, ".enOverlay")
		if ( !found) {
			break;
		}

		await sleep(1000)
	}

	console.log("Update header/footer finished.")
}

/**
 * Update the thank you email content
 *
 * @param  {WebDriver} driver Selenium WebDriver
 * @param  {object} settings
 * @param  {string} emailPath path to the email file.
 */
const enUpdateThankyouEmail = async function (driver, settings, emailPath) {
	if ( !emailPath) {
		return;
	}

	console.log("Start to upadte the thank you email content")

	let content = fs.readFileSync((emailPath), 'utf8');

	// open the edit URL
	await driver.get(`https://www.e-activist.com/index.html#pages/${settings.enPageId}/edit`);

	// p1: Wait the iframe ready
	console.log("Waiting iframe ready")
	while (true) {
		await sutils.clickElementSafely(driver, ".pboPageBuilderLocked__actions .button--ok") // other people is editing alert

		founds = await driver.findElements(By.css("iframe"))
		if (founds.length) {
			await driver.switchTo().frame(founds[0])
			await sleep(2123)
			break;
		}

		await sleep(1000)
	}

	// p2: Wait the edit panel ready
	console.log("Wait the edit panel ready")
	while (true) {
		await sutils.clickElementSafely(driver, ".en__toolbar--closed .en__toolbar__items") // open the big menu
		await sutils.clickElementSafely(driver, ".en__toolbar__item.en__toolbar__item--autoresponders") // click the sub-menu
		await sutils.clickElementSafely(driver, ".en__toolbar__item--autoresponders .en__toolbar__action.en__toolbar__action--click") // click the link

		await sutils.clickElementSafely(driver, '.pboThankemail__editors__tabs [data-type="ace"]') // text edit mode
		found = await sutils.findElementSafely(driver, ".email__ace .ace_content")
		if (found) {
			await(1500)
			break;
		}

		await sleep(1000)
	}

	// p3: Update the email content
	el = await driver.findElement(By.css(".email__ace .ace_content"))
	el.click()
	await sleep(500)

	el = await driver.findElement(By.css(".ace_editor textarea"))
	// el.sendKeys("Helloooooo")
	el.sendKeys(Key.chord(controlKey(), "a"))
	el.sendKeys(Key.DELETE)
	await sleep(100)

	let jscmd = `document.querySelector(".ace_editor textarea").value = ${JSON.stringify(content)}`
	driver.executeScript(jscmd);
	el.sendKeys(" ")

	// p4: Save iframe
	while (true) {
		el = await sutils.clickElementSafely(driver, ".enOverlay__popup--pboAutoresponder .enOverlay__popup__actions .button--save")
		el = await sutils.clickElementSafely(driver, ".enOverlay__popup--pboAutoresponder .enOverlay__popup__close")

		founds = await driver.findElements(By.css("iframe"))
		if (founds.length<1) {
			await driver.switchTo().defaultContent() // switch back to original html
			break;
		}

		await sleep(1000)
	}

	// p5: Save everything
	while (true) {
		let btns = [
			".enOverlay--pboCheckInUse .pboCheckInUse__action--save",
			".enOverlay--pboValidation .pboValidation__action--ok",
			".enOverlay__popup--pboTemplate--edit .button--save",
			".enOverlay__popup--pboPageBuilder .button--done"
		]

		for (let i=0; i<btns.length; i++) {
			await sutils.clickElementSafely(driver, btns[i])
		}

		found = await sutils.findElementSafely(driver, ".enOverlay")
		if ( !found) {
			break;
		}

		await sleep(1000)
	}

	console.log("All Done.")
}

module.exports = async function ({settings, buildDir, emailPath}) {
	let river

	try {
		driver = await new Builder().forBrowser('chrome').build();

		await enlogin(driver, settings)
		await enUpdateTmplHeaderFooter(driver, settings, buildDir)
		await enUpdateThankyouEmail(driver, settings, emailPath)
	} finally {
		if (driver) {
			await sleep(3*1000)
		  await driver.quit();
		}
	}
}