import React from "react";
import { StyleSheet, Text, ViewStyle, TextStyle } from "react-native";
import Ripple from "react-native-material-ripple";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";

const styles = StyleSheet.create({
	btn: {
		width: "100%",
		height: 45,
		borderColor: Colors.primaryBtn,
		backgroundColor: Colors.primaryBtn,
		borderWidth: 1,
		borderRadius: 25,
		alignItems: "center",
		justifyContent: "center",
	},
	btnText: {
		fontSize: 16,
		lineHeight: 24,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.white,
	},
});

type Props = {
	title: string;
	onPress: () => void;
	style?: ViewStyle;
	titleStyle?: TextStyle;
	disabled?: boolean;
};

const Button: React.FC<Props> = (props) => (
	<Ripple
		{...props}
		rippleColor={Colors.rippleColor}
		rippleDuration={550}
		rippleOpacity={0.54}
		rippleContainerBorderRadius={25}
		onPress={props.onPress}
		style={[styles.btn, props.style, props.disabled ? { opacity: 0.5 } : null]}
	>
		<Text style={[styles.btnText, props.titleStyle]}>
			{props.title || LocalizedText.SUBMIT}
		</Text>
	</Ripple>
);

export default Button;
