import { View, Text, StyleSheet, Alert, Switch } from "react-native";
import Slider from "@react-native-community/slider";
import React, { useEffect, useState } from "react";
import { Input, Icon } from "react-native-elements";
import {
	Accelerometer,
	Gyroscope,
	Magnetometer,
	DeviceMotion,
} from "expo-sensors";
import sensorStyles from "../constants/sensorStyles";
import { Animated } from "react-native";
import Accel from "./Accel";
import Gyro from "./Gyro";
import Mag from "./Mag";

// import CustomSwitch from "../components/CustomSwitch";
// import SensorSwitch from "../components/SensorSwitch";

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

const SENSOR_TOPIC = "stream/imu";
const JAW_TOPIC = "stream/jaw_angle";
const LINK_TOPIC = "stream/link_angle";
const SCHEME = "ws"; // TCP doesn't work
// const IP = "192.168.1.7"; // IP of broker
const PORT = "8883";

const SensorData = (props) => {
	const [serverIP, setServerIP] = useState("192.168.1.6");
	const [isConnected, setIsConnected] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	// mqtt client reference
	const [clientRef, setClientRef] = useState(null);
	// sampleRate in Hz
	const [samplingRate, setSamplingRate] = useState(100);

	const [jawAngle, setJawAngle] = useState(30);
	const [linkAngle, setLinkAngle] = useState(30);

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
			clientRef.publish(
				SENSOR_TOPIC,
				JSON.stringify({
					acc: accel,
					gyro: gyro,
					mag: mag,
				})
			);
		},
		isStreaming ? samplingRate : null
	);

	useEffect(() => {
		// const client = mqtt.connect(`${SCHEME}://${IP}:${PORT}`, options);
		// client.on("connect", () => console.log("Connected"));
		// setClientRef(client);
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
		const client = mqtt.connect(`${SCHEME}://${serverIP}:${PORT}`, options);
		client.on("connect", () => {
			console.log("Connected to broker");
		});
		setIsConnected(true);
		setClientRef(client);
	};

	const disconnect = async () => {
		// close the connection if it exists
		clientRef && clientRef.end();
		console.log("disconnected from broker");
		setClientRef(null);
		setIsConnected(false);
	};

	const _subscribe = (sensorType) => {
		console.log(`Subscribing to ${sensorType}...`);
		switch (sensorType) {
			case "Accelerometer":
				setAccelSub(
					Accelerometer.addListener((data) => setAccel(data))
				);
				Accelerometer.setUpdateInterval(samplingRate);
				break;
			case "Gyroscope":
				setGyroSub(Gyroscope.addListener((data) => setGyro(data)));
				Gyroscope.setUpdateInterval(samplingRate);
				break;
			case "Magnetometer":
				setMagSub(Magnetometer.addListener((data) => setMag(data)));
				Magnetometer.setUpdateInterval(samplingRate);
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
		if (isConnected && clientRef) {
			console.log("Streaming data...");
			setIsStreaming(true);
		}
	};

	const stopStreaming = () => {
		console.log("Stopping stream...");
		setIsStreaming(false);
	};

	const updateSamplingRate = (interval) => {
		// dont update sampling rate while streaming
		if (isStreaming) {
			Alert.alert("Don't change sampling rate while you're streaming !");
			return;
		}
		// clamp sampling rate between 1 and 100Hz
		interval = Math.max(interval, 50);
		setSamplingRate(interval);

		console.log(`sampling interval: ${interval} ms`);
		Accelerometer.setUpdateInterval(interval);
	};

	return (
		<View style={[styles.container, styles.borders]}>
			<Input
				label="IP address of mqtt broker"
				placeholder="192.168.1.2"
				onChangeText={(value) => setServerIP(value)}
			/>
			<Input
				label="Sampling interval (min 50 ms)"
				placeholder="100ms"
				onChangeText={(interval) => updateSamplingRate(interval)}
			/>
			{/* connect to broker */}
			<View style={[sensorStyles.sensorToggle]}>
				<Switch
					trackColor={{
						false: theme.trackFalseColor,
						true: theme.trackTrueColor,
					}}
					thumbColor={
						isConnected ? theme.thumbColor : theme.thumbColor
					}
					onValueChange={() =>
						isConnected ? disconnect() : connect()
					}
					value={isConnected}
					style={{
						transform: [{ scaleX: 1 }, { scaleY: 1 }],
					}}
				/>
				<Text
					style={[
						sensorStyles.text,
						sensorStyles.sensorName,
						{ color: "#ff9a00" },
					]}
				>
					Connect to broker
				</Text>
			</View>
			{/* stream data toggle */}
			<View style={[sensorStyles.sensorToggle]}>
				<Switch
					trackColor={{
						false: theme.trackFalseColor,
						true: theme.trackTrueColor,
					}}
					thumbColor={
						isStreaming ? theme.thumbColor : theme.thumbColor
					}
					onValueChange={() =>
						isStreaming ? stopStreaming() : startStreaming()
					}
					value={isStreaming}
					style={{
						transform: [{ scaleX: 1 }, { scaleY: 1 }],
					}}
				/>
				<Text
					style={[
						sensorStyles.text,
						sensorStyles.sensorName,
						{ color: "#ff9a00" },
					]}
				>
					Stream data
				</Text>
			</View>
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
			<Slider
				style={{ width: 200, height: 50 }}
				minimumValue={-40}
				maximumValue={40}
				minimumTrackTintColor="#000000"
				maximumTrackTintColor="#000000"
				step={5}
				value={jawAngle}
				onValueChange={(angle) => {
					clientRef.publish(
						JAW_TOPIC,
						JSON.stringify({
							jaw_angle: angle,
						})
					);
					setJawAngle(angle);
				}}
			/>
			<Text>Jaw angle: {jawAngle} degrees</Text>

			<Slider
				style={{ width: 200, height: 50 }}
				minimumValue={-40}
				maximumValue={40}
				minimumTrackTintColor="#000000"
				maximumTrackTintColor="#000000"
				step={5}
				value={linkAngle}
				onValueChange={(angle) => {
					clientRef.publish(
						LINK_TOPIC,
						JSON.stringify({
							link_angle: angle,
						})
					);
					setLinkAngle(angle);
				}}
			/>
			<Text>Link angle: {linkAngle} degrees</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	borders: {
		// borderColor: "green",
		// borderWidth: 3,
	},
	container: {
		width: "90%",
		height: "90%",
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
