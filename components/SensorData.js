import {
	View,
	Text,
	Button,
	StyleSheet,
	Alert,
	TextInput,
	TouchableOpacityBase,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Input, Switch, Slider } from "react-native-elements";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";

import Accel from "./Accel";
import Gyro from "./Gyro";
import Mag from "./Mag";

const mqtt = require("@taoqf/react-native-mqtt");

import useInterval from "../helpers/useInterval";

import theme from "../constants/theme";

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

const TOPIC = "sensornode/livestream";
const SCHEME = "ws"; // TCP doesn't work
const IP = "192.168.1.7"; // IP of broker
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

	useInterval(
		() => {
			// console.log(gyro.x, gyro.y, gyro.x);
			clientRef.publish(
				TOPIC,
				JSON.stringify({
					acc: accel,
					gyro: gyro,
					mag: mag,
				})
			);
		},
		isStreaming ? 50 : null
	);

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

	const _subscribe = (sensorType) => {
		console.log(`Subscribing to ${sensorType}...`);
		switch (sensorType) {
			case "Accelerometer":
				setAccelSub(
					Accelerometer.addListener((data) => setAccel(data))
				);
				Accelerometer.setUpdateInterval(50);
				break;
			case "Gyroscope":
				setGyroSub(Gyroscope.addListener((data) => setGyro(data)));
				Gyroscope.setUpdateInterval(50);
				break;
			case "Magnetometer":
				setMagSub(Magnetometer.addListener((data) => setMag(data)));
				Magnetometer.setUpdateInterval(50);
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
		setIsStreaming(true);
	};

	const stopStreaming = () => {
		console.log("Stopping stream...");
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
					isStreaming ? setIsStreaming(false) : setIsStreaming(true)
				}
				value={isStreaming}
			/>

			<Accel
				subscription={accelSub}
				// data={accel}
				subscribe={_subscribe}
				unsubscribe={_unsubscribe}
			/>
			<Gyro
				subscription={gyroSub}
				// data={gyro}
				subscribe={_subscribe}
				unsubscribe={_unsubscribe}
			/>
			<Mag
				subscription={magSub}
				// data={mag}
				subscribe={_subscribe}
				unsubscribe={_unsubscribe}
			/>
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
});

export default SensorData;
