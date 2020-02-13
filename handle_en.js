const path = require('path')
const fs = require('fs')
const {Builder, By, Key, until} = require('selenium-webdriver');

const SHORT_WAIT = 5*1000
const LONG_WAIT = 30*1000

function sleep(ms) {
	console.debug(`Wait ${ms/1000} seconds`)
  return new Promise(resolve => setTimeout(resolve, ms));
}


function controlKey () {
	if (process.platform === "darwin") {
		return Key.COMMAND
	}
	return Key.CONTROL
}


module.exports = async (settings, localDir) => {
	console.log('settings', settings)

	let driver
	try {
		//
		console.log("Fetching header and footer from build folder")

		let content = fs.readFileSync(path.join(localDir, 'index.html'), 'utf8');
		let matches = content.match(/(.*)(<form[^<]+en__component.*form>)(.*)/)
		let header, footer
		if (matches) {
			header = matches[1]
			footer = matches[3]
		} else {
			throw new Error(`Cannot resolve header and footer from file ${path.join(localDir, 'index.html')}`)
		}

		// start to execute selenium
		driver = await new Builder().forBrowser('chrome').build();

		await driver.get(`https://www.e-activist.com/index.html#pages/${settings.enPageId}/edit`);


		console.info("Login to Engaging Network")
		await driver.wait(until.elementLocated(By.css("#enLoginUsername")), LONG_WAIT);
		// await driver.wait(until.elementIsVisible(By.css("#enLoginUsername")), LONG_WAIT);

		await driver.findElement(By.css("#enLoginUsername")).sendKeys(settings.username)
		await driver.findElement(By.css("#enLoginPassword")).sendKeys(settings.password)
		await driver.findElement(By.css(".button.button--login")).click()

		// _TODO_ Support Chris' account

		console.debug("Waiting the editing screen to show")
		await driver.wait(until.elementLocated(By.css(".pboPB__button.pboPB__button--template")), LONG_WAIT);
		await driver.wait(until.elementIsNotVisible(driver.findElement(By.css(".enOverlay--pboPageBuilder .messageOverlay.loading"))), LONG_WAIT);

		await driver.findElement(By.css(".pboPB__button.pboPB__button--template")).click()

		console.debug("Waiting the editor to show up")
		await driver.wait(until.elementLocated(By.css(".pboTemplate__editor")), LONG_WAIT);
		await driver.wait(until.elementIsVisible(driver.findElement(By.css(".pboTemplate__editor"))), LONG_WAIT);

		console.debug("Updating Header Content")
		await driver.findElement(By.css(".pboTemplate__editor--header")).click()

		el = await driver.findElement(By.css(".pboTemplate__editor--header textarea"))
		el.sendKeys(Key.chord(controlKey(), "a"))
		el.sendKeys(Key.DELETE)
		await(500)

		let jscmd = `document.querySelector('.pboTemplate__editor--header .ace_text-input').value = ${JSON.stringify(header)}`
		driver.executeScript(jscmd);
		el.sendKeys(" ")

		console.debug("Updating Footer Content")
		await driver.findElement(By.css(".pboTemplate__editor--footer")).click()

		el = await driver.findElement(By.css(".pboTemplate__editor--footer textarea"))
		el.sendKeys(Key.chord(controlKey(), "a"))
		el.sendKeys(Key.DELETE)
		await(500)

		jscmd = `document.querySelector('.pboTemplate__editor--footer .ace_text-input').value = ${JSON.stringify(footer)}`
		driver.executeScript(jscmd);
		el.sendKeys(" ")

		console.debug("Save the content")
		let btns = [
			".enOverlay--pboCheckInUse .pboCheckInUse__action--save",
			".enOverlay--pboValidation .pboValidation__action--ok",
			".enOverlay--pboTemplate--edit .button--save",
			".enOverlay__popup--pboPageBuilder .button--done"
		]

		let founds
		while (true) {
			// wait all the loading screen disappear
			founds = driver.findElements(By.css(".messageOverlay.loading"))
			for (let i=0; i<founds.length; i++) {
				await driver.wait(until.elementIsNotVisible(founds[i]), LONG_WAIT);
			}
			await sleep(1500) // the loading screen has animations

			for (let i=0; i<btns.length; i++) {
				founds = await driver.findElements(By.css(btns[i]))

				if (founds.length) {
					let isDisplayed = await founds[0].isDisplayed()
					let isEnabled = await founds[0].isEnabled()

					if (isDisplayed && isEnabled) {
						founds[0].click()
						await sleep(2000)
						break;
					}
				}
			}

			founds = await driver.findElements(By.css(".enOverlay"))
			if (founds.length==0) {
				break;
			}
		}

		await sleep(10*1000)
		await driver.quit();
	} finally {
		// await sleep(5*1000)
		if (driver) {
		  // await driver.quit();
		}
	}
}