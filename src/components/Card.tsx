import React from "react";
import {
	StyleSheet,
	View,
	TouchableHighlight,
	Platform,
	ViewStyle,
} from "react-native";
import Colors from "../configs/Colors";

type Props = {
	children: React.ReactNode;
	style?: ViewStyle | Array<ViewStyle>;
	onPress?: () => void;
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.white,
		borderRadius: 8,
		...Platform.select({
			android: {
				elevation: 3,
			},
			ios: {
				shadowColor: Colors.shadowColor,
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 1,
				shadowRadius: 2,
			},
		}),
	},
});

const Card: React.FC<Props> = (props) =>
	props.onPress ? (
		<TouchableHighlight
			underlayColor={Colors.lightGrey}
			onPress={props.onPress}
			style={[styles.container, props.style]}
		>
			{props.children}
		</TouchableHighlight>
	) : (
		<View style={[styles.container, props.style]}>{props.children}</View>
	);

export default Card;
