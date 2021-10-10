function formatData(measurement) {
	x = measurement.x.toPrecision(3);
	y = measurement.y.toPrecision(3);
	z = measurement.z.toPrecision(3);
	return `x: ${x}\ny: ${y}\nz: ${z}`;
}

export default formatData;
