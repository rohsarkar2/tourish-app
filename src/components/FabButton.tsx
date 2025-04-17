import React from "react";
import { StyleSheet, ViewStyle, Platform } from "react-native";
import Ripple from "react-native-material-ripple";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import Colors from "../configs/Colors";

const styles = StyleSheet.create({
	btn: {
		width: 50,
		height: 50,
		right: 25,
		bottom: 25,
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 100,
		backgroundColor: Colors.primaryBtn,
		...Platform.select({
			android: {
				elevation: 5,
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

type Props = {
	icon: any;
	onPress: () => void;
	disabled?: boolean;
	style?: ViewStyle;
};

const FabButton: React.FC<Props> = (props) => (
	<Ripple
		{...props}
		rippleColor={Colors.rippleColor}
		rippleDuration={550}
		rippleOpacity={0.54}
		rippleContainerBorderRadius={25}
		onPress={props.onPress}
		style={[styles.btn, props.style, props.disabled ? { opacity: 0.5 } : null]}
	>
		<FontAwesomeIcon icon={props.icon} size={25} color={Colors.white} />
	</Ripple>
);

export default FabButton;
