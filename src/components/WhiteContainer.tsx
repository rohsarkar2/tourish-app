import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Colors from "../configs/Colors";

type Props = {
	children: React.ReactNode;
	style?: ViewStyle;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
});

const WhiteContainer: React.FC<Props> = (props) => (
	<View style={[styles.container, props.style]}>{props.children}</View>
);

export default WhiteContainer;
