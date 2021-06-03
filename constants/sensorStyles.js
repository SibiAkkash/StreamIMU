import { StyleSheet } from "react-native";

const sensorStyles = StyleSheet.create({
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
		width: "100%",

		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",

		backgroundColor: "#222831",
		padding: 10,
		marginVertical: 5,
		borderRadius: 10,
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
		fontSize: 16,
		fontWeight: "bold",
		color: "#08d9d6",
	},
	text: {
		color: "#eeeeee",
		fontSize: 20,
	},
});

export default sensorStyles;
