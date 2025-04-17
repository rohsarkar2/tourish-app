import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSquareCheck } from "@fortawesome/pro-solid-svg-icons/faSquareCheck";
import { faSquare } from "@fortawesome/pro-light-svg-icons/faSquare";
import Colors from "../configs/Colors";

type Props = {
	title: string;
	isChecked: boolean;
	onPress: () => void;
	size?: number;
	style?: ViewStyle | Array<ViewStyle>;
};

const CheckBox = (props: Props) => {
	return (
		<Pressable style={[styles.container, props.style]} onPress={props.onPress}>
			<View style={{ width: props.size ? props.size + 8 : 25 }}>
				<FontAwesomeIcon
					icon={props.isChecked ? faSquareCheck : faSquare}
					size={props.size ? props.size : 18}
					color={props.isChecked ? Colors.secondary : Colors.primaryFont}
					style={{ marginTop: 2 }}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<Text style={styles.title} numberOfLines={3} ellipsizeMode="tail">
					{props.title}
				</Text>
			</View>
		</Pressable>
	);
};

export default CheckBox;

const styles = StyleSheet.create({
	container: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "flex-start",
		paddingVertical: 5,
	},
	title: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
});
