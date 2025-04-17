import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Colors from "../configs/Colors";

type Props = {
	children: React.ReactNode;
	style?: ViewStyle;
};

const styles = StyleSheet.create({
	container: {
		height: 45,
		width: 45,
		backgroundColor: Colors.secondary,
		borderRadius: 90,
		alignItems: "center",
		justifyContent: "center",
	},
});

const ListAvatar: React.FC<Props> = (props) => (
	<View style={[styles.container, props.style]}>{props.children}</View>
);

export default ListAvatar;
