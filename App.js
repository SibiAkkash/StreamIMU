import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import SensorData from "./components/SensorData";

export default function App() {
	const [isStreaming, setIsStreaming] = useState(false);

	const toggleStreaming = (value) => {
		setIsStreaming((prevState) => !prevState);
	};

	return (
		<View style={styles.container}>
			<SensorData />
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
