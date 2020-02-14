const {Builder, By, Key, until, error} = require('selenium-webdriver');

const self = module.exports = {
	/**
	 * Promise version sleep
	 * @param  {number} ms
	 *
	 * Usage:
	 * await sleep(2000)
	 * // do other things
	 */
	sleep: (ms) => {
		if (ms>1000) {
			console.debug(`Wait ${ms/1000} seconds`)
		}
	  return new Promise(resolve => setTimeout(resolve, ms));
	},

	/**
	 * Resolve to use cmd or ctrl to perform copy and past
	 * @return {Key} Key.COMMAND or Key.CONTROL
	 */
	controlKey: () => {
		if (process.platform === "darwin") {
			return Key.COMMAND
		}
		return Key.CONTROL
	},

	/**
	 * Find the isDisplayed and isEnabled element by the given css selector
	 *
	 * @param  {WebDriver} driver
	 * @param  {string} selector CSS selector
	 * @return {mxied} WebElement or null
	 */
	findElementSafely: async function (driver, selector, safe=true) {
		let founds = await driver.findElements(By.css(selector))

		if ( !safe) {
			return founds.length ? founds[founds.length-1] : null
		}

		for (var i = founds.length - 1; i >= 0; i--) {
			if (founds[i].isDisplayed() && founds[i].isEnabled()) {
				return founds[i]
			}
		}

		return null
	},

	/**
	 * Click the element if found.
	 * The function will not throw error when it cannot find the element or cannot click.
	 *
	 * @param  {WebDriver} driver
	 * @param  {string} selector
	 * @return {mixed} WebElement if clicked. Or null
	 */
	clickElementSafely: async function (driver, selector) {
		let el = await self.findElementSafely(driver, selector, safe=false)

		if (el) {
			let clicked = false
			await el.click()
				.then(() => {
					clicked = true
					console.debug("Clicked", selector)
				})
				.catch(e => {
					if (e.message.indexOf("is not clickable at point")>-1) {
						// ignore error like this: Element <button> is not clickable at point (1084, 47).
						// Other element would receive the click: <div class="enOverlay__popup__header">...</div>
					} else if (e.message.indexOf("element not interactable")>-1) {
						// ElementNotVisibleError: element not interactable
					} else if (e.message.indexOf("element is not attached to the page document")>-1) {
						// StaleElementReferenceError: stale element reference: element is not attached to the page document
					} else {
						throw e
					}
				})
			if (clicked) {
				await self.sleep(1500)
				return el
			}
		}

		return null
	}
}

