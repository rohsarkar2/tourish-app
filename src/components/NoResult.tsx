import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import Colors from "../configs/Colors";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	title: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		marginTop: 8,
		lineHeight: 25,
		opacity: 0.8,
		textAlign: "center",
	},
	subText: {
		fontFamily: "Roboto-Regular",
		fontSize: 12,
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.6,
		lineHeight: 20,
		textAlign: "center",
	},
});

type Props = {
	title: string;
	description?: string;
	titleStyle?: TextStyle;
	style?: ViewStyle;
};

const NoResult: React.FC<Props> = (props) => (
	<View style={[styles.container, props.style]}>
		<FontAwesomeIcon
			icon={faMagnifyingGlass}
			size={30}
			color={Colors.mediumGrey}
		/>
		<Text style={[styles.title, props.titleStyle]}>{props.title}</Text>
		{props.description ? (
			<Text style={styles.subText}>{props.description}</Text>
		) : null}
	</View>
);

export default NoResult;
