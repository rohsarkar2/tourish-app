import React, { useRef, useEffect, useState } from "react";
import {
	Animated,
	Easing,
	TextInput,
	Text,
	StyleSheet,
	ViewStyle,
	TextInputProps,
} from "react-native";
import Colors from "../configs/Colors";

type Props = TextInputProps & {
	label?: string;
	style?: ViewStyle | Array<ViewStyle> | null;
	error?: string | null;
};

const InputField: React.FC<Props> = (props: Props) => {
	const animatedValue = useRef(new Animated.Value(0)).current;
	const [isFocused, setIsFocused] = useState(false);

	const returnAnimatedTitleStyles = {
		transform: [
			{
				translateY: animatedValue.interpolate({
					inputRange: [0, 1],
					outputRange: [25, 5],
					extrapolate: "clamp",
				}),
			},
		],
		fontSize: animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [14, 12],
			extrapolate: "clamp",
		}),
		color: animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: props.error
				? [Colors.danger, Colors.danger]
				: isFocused
				? [Colors.mediumGrey, Colors.secondary]
				: [Colors.mediumGrey, Colors.mediumGrey],
		}),
	};

	const viewStyles = {
		borderBottomColor: animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: props.error
				? [Colors.danger, Colors.danger]
				: isFocused
				? [Colors.secondary, Colors.secondary]
				: [Colors.lightBorder, Colors.lightBorder],
		}),
		borderBottomWidth: 1,
		paddingBottom: 10,
		height: 50,
		marginBottom: 15,
	};

	useEffect(() => {
		if (props.value || isFocused) {
			Animated.timing(animatedValue, {
				toValue: 1,
				duration: 50,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start();
		} else {
			Animated.timing(animatedValue, {
				toValue: 0,
				duration: 200,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start();
		}
	}, [props.value, isFocused]);

	const handleFocus = () => {
		setIsFocused(true);
		Animated.timing(animatedValue, {
			toValue: 1,
			duration: 50,
			easing: Easing.linear,
			useNativeDriver: false,
		}).start();
	};

	const handleBlur = () => {
		setIsFocused(false);
		if (typeof props.value !== "undefined") {
			Animated.timing(animatedValue, {
				toValue: 0,
				duration: 200,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start();
		}
	};

	return (
		<Animated.View style={[viewStyles, props.style]}>
			<Animated.Text style={[returnAnimatedTitleStyles]}>
				{props.label}
			</Animated.Text>
			<TextInput
				{...props}
				style={styles.textStyle}
				onBlur={handleBlur}
				onFocus={handleFocus}
			/>
			{props.error && <Text style={styles.errorText}>{props.error}</Text>}
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	textStyle: {
		fontSize: 14,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		paddingLeft: 0,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
	},
});

export default InputField;
