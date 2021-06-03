import { View, Text, Switch } from "react-native";
import React from "react";
import {} from "react-native-elements";
import formatData from "../helpers/formatData";
import theme from "../constants/theme";
import sensorStyles from "../constants/sensorStyles";

const Mag = (props) => {
	return (
		<View style={[sensorStyles.sensorToggle]}>
			<Switch
				trackColor={{
					false: theme.trackFalseColor,
					true: theme.trackTrueColor,
				}}
				thumbColor={
					props.subscription ? theme.thumbColor : theme.thumbColor
				}
				onValueChange={() =>
					props.subscription
						? props.unsubscribe("Magnetometer")
						: props.subscribe("Magnetometer")
				}
				value={props.subscription !== null}
			/>
			<Text style={[sensorStyles.text, sensorStyles.sensorName]}>
				Magnetometer
			</Text>
		</View>
	);
};

export default Mag;
