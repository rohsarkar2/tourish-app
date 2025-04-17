import React, { Fragment } from "react";
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import CustomStatusBar from "./CustomStatusBar";

type Props = {
	children: React.ReactNode;
	statusBarColor?: string;
	statusBarStyle?: "dark-content" | "light-content";
	style?: ViewStyle | ViewStyle[];
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		height: Constant.WINDOW_HEIGHT,
		backgroundColor: Colors.primaryBg,
	},
});

const Container: React.FC<Props> = (props) => (
	<Fragment>
		<CustomStatusBar
			barStyle={props.statusBarStyle ? props.statusBarStyle : "dark-content"}
			backgroundColor={
				props.statusBarColor ? props.statusBarColor : Colors.statusBar2
			}
		/>
		<SafeAreaView style={[styles.container, props.style]}>
			{props.children}
		</SafeAreaView>
	</Fragment>
);

export default Container;
