import React, { useEffect, useState } from "react";
import { Pressable, View, Animated, StyleSheet, ViewStyle } from "react-native";
import Colors from "../configs/Colors";

type Props = {
	value: boolean;
	onValueChange: () => void;
	style?: ViewStyle | ViewStyle[];
};

const Switch: React.FC<Props> = (props: Props) => {
	const { value } = props;
	const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: value ? 1 : 0,
			duration: 300,
			useNativeDriver: false,
		}).start();
	}, [value]);

	const translateX = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [4, 23],
	});

	return (
		<Pressable
			onPress={props.onValueChange}
			style={[
				styles.pressable,
				props.style,
				{
					backgroundColor: props.value
						? Colors.primaryBg
						: "rgba(150, 150, 150, 0.5)",
				},
			]}
		>
			<View style={[styles.backgroundGradient]}>
				<View style={styles.innerContainer}>
					<Animated.View
						style={{
							transform: [{ translateX }],
						}}
					>
						<View
							style={[styles.headGradient, { backgroundColor: Colors.white }]}
						/>
					</Animated.View>
				</View>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	pressable: {
		width: 45,
		height: 26,
		borderRadius: 16,
	},
	backgroundGradient: {
		borderRadius: 25,
		flex: 1,
	},
	innerContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		position: "relative",
	},
	headGradient: {
		width: 18,
		height: 18,
		borderRadius: 16,
	},
});

export default Switch;
