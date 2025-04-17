import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";
import Button from "./Button";
import LocalizedText from "../resources/LocalizedText";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 25,
	},
	title: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 20,
		color: Colors.secondaryFont,
		marginBottom: 10,
		textAlign: "center",
	},
	subText: {
		fontFamily: "Roboto-Regular",
		fontSize: 13,
		fontWeight: "400",
		color: Colors.secondaryFont,
		textAlign: "center",
		opacity: 0.9,
		lineHeight: 18,
	},
	btn: {
		marginTop: 30,
		height: 40,
		width: "95%",
	},
});

type Props = {
	style?: ViewStyle;
	onPress?: () => void;
};

const SignInRequired: React.FC<Props> = (props) => {
	const navigation = useNavigation<NavigationProp<RootStackParamList>>();

	const gotoSignIn = () => {
		navigation.navigate("SignIn");
	};

	return (
		<View style={[styles.container, props.style]}>
			<Text style={styles.title}>{LocalizedText.SIGN_IN_TO_CONTINUE}</Text>
			<Text style={styles.subText}>
				{LocalizedText.SIGN_IN_REQUIRED_MESSAGE}
			</Text>

			<Button
				title={LocalizedText.SIGN_IN}
				style={styles.btn}
				onPress={props.onPress ? props.onPress : gotoSignIn}
			/>
		</View>
	);
};

export default SignInRequired;
