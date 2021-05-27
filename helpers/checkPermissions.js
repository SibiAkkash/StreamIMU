async function checkPermissions() {
	//TODO check this
	let status = await Accelerometer.getPermissionsAsync();
	if (status !== "granted") {
		let finalStatus = await Accelerometer.requestPermissionsAsync();
		if (finalStatus !== "granted") {
			return;
		}
	}
	status = finalStatus;
	return status;
}

export default checkPermissions;
