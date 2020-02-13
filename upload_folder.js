var FTPS = require('ftps');

/**
 * Use lftp to sync local dir to remote
 *
 * @param  {object} settings
 * @param  {string} localDir Local folder to update
 * @param  {string} remoteDir The remote path to upload. If it's not exist, it will be created.
 */
module.exports = (settings, localDir, remoteDir) => {
	// @see https://github.com/Atinux/node-ftps for arguments
	var ftps = new FTPS(settings);

	console.info(`Sync from \`${localDir}\` to \`${settings.protocol}://${settings.username}@${settings.host}:${remoteDir}\``)
	ftps.mirror({
			localDir: localDir,
			remoteDir: settings.remoteDir,
			upload: true
		})
		.cd(settings.remoteDir)
		.ls()
		.exec(function (err, res) {
			// err will be null (to respect async convention)
			// res is an hash with { error: stderr || null, data: stdout }
			if (err) {
				console.error(err)
			} else {
				console.info("Successfully uploaded.")
				console.info(res.data)
			}
		});
}