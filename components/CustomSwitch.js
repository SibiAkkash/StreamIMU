import React from "react";
import { View, Text, Switch } from "react-native";
import sensorStyles from "../constants/sensorStyles";
import theme from "../constants/theme";

const CustomSwitch = ({
	label,
	toggleValue,
	switchOn,
	switchOff,
	labelColor,
	bgColor,
	sizeScale,
}) => {
	return (
		<View style={[sensorStyles.sensorToggle]}>
			<Switch
				trackColor={{
					false: theme.trackFalseColor,
					true: theme.trackTrueColor,
				}}
				thumbColor={toggleValue ? theme.thumbColor : theme.thumbColor}
				onValueChange={() => (toggleValue ? switchOff() : switchOn())}
				value={toggleValue}
				style={{
					transform: [
						{ scaleX: sizeScale || 1 },
						{ scaleY: sizeScale || 1 },
					],
				}}
			/>
			<Text
				style={[
					sensorStyles.text,
					sensorStyles.sensorName,
					{ color: labelColor },
				]}
			>
				{label || "switch label"}
			</Text>
		</View>
	);
};

export default CustomSwitch;
