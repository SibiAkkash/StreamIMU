import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	TextInput,
	TouchableOpacityBase,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Input, Switch, Slider } from "react-native-elements";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";

const mqtt = require("@taoqf/react-native-mqtt");

function formatData(measurement) {
	x = measurement.x.toPrecision(3);
	y = measurement.y.toPrecision(3);
	z = measurement.z.toPrecision(3);
	return `x: ${x}\ny: ${y}\nz: ${z}`;
}

const theme = {
	sensorContainer: "#9fe6a0",
	sensorToggle: "#4aa96c",
	sensorOutput: "#9fe6a0",
	trackTrueColor: "#ff2e63",
	trackFalseColor: "#767577",
	textColor: "#eeeeee",
	thumbColor: "#eeeeee",
	sensorName: "#ff9a00",
};

let options = {
	keepalive: 10,
	clientId: "mqtt" + Math.random().toString(16).substr(2, 8),
	protocolId: "MQIsdp",
	protocolVersion: 3,
	clean: true,
	reconnectPeriod: 20000,
	connectTimeout: 30 * 1000,
	protocol: "mqtt",
	rejectUnauthorized: false,
};

const topic = "sensornode/livestream";
const SCHEME = "ws"; // TCP doesn't work
const IP = "192.168.1.4"; // IP of broker
const PORT = "8883";

const SensorData = (props) => {
	const [isStreaming, setIsStreaming] = useState(false);
	// mqtt client reference
	const [clientRef, setClientRef] = useState(null);
	// store the stream interval reference, to stop streaming when switch is toggled
	const [streamIntervalRef, setStreamIntervalRef] = useState(null);
	// sampleRate in Hz
	const [samplingRate, setSamplingRate] = useState(100);

	// subscriptions for listening to sensor values
	const [accelSub, setAccelSub] = useState(null);
	const [gyroSub, setGyroSub] = useState(null);
	const [magSub, setMagSub] = useState(null);
	// sensors values
	const [accel, setAccel] = useState({
		x: 0,
		y: 0,
		z: 0,
	});
	const [gyro, setGyro] = useState({
		x: 0,
		y: 0,
		z: 0,
	});
	const [mag, setMag] = useState({
		x: 0,
		y: 0,
		z: 0,
	});

	useEffect(() => {
		const client = mqtt.connect(`${SCHEME}://${IP}:${PORT}`, options);
		client.on("connect", () => console.log("Connected"));
		setClientRef(client);
	}, []);

	const sendData = () => {
		clientRef.publish(
			topic,
			JSON.stringify({
				acc: accel,
				gyro: gyro,
				mag: mag,
			}),
			console.log
		);
	};

	const connect = () => {
		// const client = mqtt.connect(`${SCHEME}://${IP}:${PORT}`, options);
		// client.on("connect", () => console.log("Connected"));
	};

	const disconnect = async () => {
		// close the connection if it exists
		clientRef && clientRef.end();
	};

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

	const _subscribe = (sensorType) => {
		console.log(`Subscribing to ${sensorType}...`);
		switch (sensorType) {
			case "Accelerometer":
				setAccelSub(
					Accelerometer.addListener((data) => setAccel(data))
				);
				break;
			case "Gyroscope":
				setGyroSub(Gyroscope.addListener((data) => setGyro(data)));
				break;
			case "Magnetometer":
				setMagSub(Magnetometer.addListener((data) => setMag(data)));
				break;
		}
	};

	const _unsubscribe = (sensorType) => {
		console.log(`Unsubscribing from ${sensorType}...`);
		switch (sensorType) {
			case "Accelerometer":
				// remove the lisetener if it exits
				accelSub && accelSub.remove();
				// clear out the object
				setAccelSub(null);
				break;
			case "Gyroscope":
				gyroSub && gyroSub.remove();
				setGyroSub(null);
				break;
			case "Magnetometer":
				magSub && magSub.remove();
				setMagSub(null);
				break;
		}
	};

	const startStreaming = () => {
		//TODO check if client is connected first
		console.log("Streaming data...");
		let interval = setInterval(() => {
			clientRef.publish(
				topic,
				JSON.stringify({
					acc: accel,
					gyro: gyro,
					mag: mag,
				})
			);
		}, 1000);
		setStreamIntervalRef(interval);
		setIsStreaming(true);
	};

	const stopStreaming = () => {
		console.log("Stopping stream...");
		clearInterval(streamIntervalRef);
		setIsStreaming(false);
	};

	const updateSamplingRate = (event) => {
		let freq = parseInt(event.nativeEvent.text);

		// dont update sampling rate while streaming
		if (isStreaming) {
			Alert.alert("Don't change sampling rate while you're streaming !");
			return;
		}
		// clamp sampling rate between 1 and 100Hz
		freq = Math.min(Math.max(freq, 1), 100);
		setSamplingRate(freq);

		// intervalMs - desired interval between milliseconds between sensor updates
		// 100Hz => 100 updates per second => 0.01 seconds between each update => 0.01 * 1000 milliseconds = 10ms
		let interval = Math.floor((1 / freq) * 1000);
		console.log(`freq; ${freq}Hz\t interval: ${interval}ms`);
		Accelerometer.setUpdateInterval(interval);
	};

	return (
		<View style={[styles.container, styles.borders]}>
			{/* stream toggle */}
			<Text>Stream data</Text>
			<Switch
				trackColor={{
					false: theme.trackFalseColor,
					true: theme.trackTrueColor,
				}}
				thumbColor={isStreaming ? theme.thumbColor : theme.thumbColor}
				onValueChange={() =>
					isStreaming ? stopStreaming() : startStreaming()
				}
				value={isStreaming}
			/>

			{/* main view */}
			<View style={[styles.sensorContainer]}>
				<View style={[styles.sensorToggle]}>
					<Switch
						trackColor={{
							false: theme.trackFalseColor,
							true: theme.trackTrueColor,
						}}
						thumbColor={
							accelSub ? theme.thumbColor : theme.thumbColor
						}
						onValueChange={() =>
							accelSub
								? _unsubscribe("Accelerometer")
								: _subscribe("Accelerometer")
						}
						value={accelSub !== null}
					/>
					<Text style={[styles.text, styles.sensorName]}>
						Accelerometer
					</Text>
				</View>
				<View style={[styles.sensorOutput]}>
					<Text style={styles.text}>{formatData(accel)}</Text>
				</View>
			</View>

			<View style={[styles.sensorContainer]}>
				<View style={[styles.sensorToggle]}>
					<Switch
						trackColor={{
							false: theme.trackFalseColor,
							true: theme.trackTrueColor,
						}}
						thumbColor={
							gyroSub ? theme.thumbColor : theme.thumbColor
						}
						onValueChange={() =>
							gyroSub
								? _unsubscribe("Gyroscope")
								: _subscribe("Gyroscope")
						}
						value={gyroSub !== null}
					/>
					<Text style={[styles.text, styles.sensorName]}>
						Gyroscope
					</Text>
				</View>
				<View style={[styles.sensorOutput]}>
					<Text style={styles.text}>{formatData(gyro)}</Text>
				</View>
			</View>

			<View style={[styles.sensorContainer]}>
				<View style={[styles.sensorToggle]}>
					<Switch
						trackColor={{
							false: theme.trackFalseColor,
							true: theme.trackTrueColor,
						}}
						thumbColor={
							magSub ? theme.thumbColor : theme.thumbColor
						}
						onValueChange={() =>
							magSub
								? _unsubscribe("Magnetometer")
								: _subscribe("Magnetometer")
						}
						value={magSub !== null}
					/>
					<Text style={[styles.text, styles.sensorName]}>
						Magnetometer
					</Text>
				</View>
				<View style={[styles.sensorOutput]}>
					<Text style={styles.text}>{formatData(mag)}</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	borders: {
		borderColor: "green",
		borderWidth: 3,
	},
	container: {
		width: 320,
		flexGrow: 1,
		flexBasis: "auto",

		display: "flex",
		justifyContent: "center",
		alignItems: "center",

		marginHorizontal: 0,
		marginVertical: 100,
		padding: 16,
	},
	sensorContainer: {
		flexBasis: "auto",
		flexGrow: 1,

		display: "flex",
		alignSelf: "stretch",
		marginVertical: 10,

		backgroundColor: "#393e46",
		borderRadius: 5,
	},
	sensorToggle: {
		// flex: 1,
		// flexGrow: 1,
		flexBasis: "auto",

		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",

		backgroundColor: "#222831",
		padding: 10,
		borderRadius: 5,
	},
	sensorOutput: {
		// flex: 2,
		flexBasis: "auto",
		flexGrow: 1,

		display: "flex",
		justifyContent: "space-around",
		alignItems: "center",
		// paddingHorizontal: 10,
	},
	sensorName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#08d9d6",
	},
	text: {
		color: "#eeeeee",
		fontSize: 20,
	},
});

export default SensorData;
