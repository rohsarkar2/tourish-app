import React from "react";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";
//@ts-ignore
import Image from "react-native-remote-svg";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0, 0, 0, 0.1)",
	},
});

type Props = {
	isVisible: boolean;
	size?: number;
};

const AbsoluteLoader: React.FC<Props> = (props) => {
	const viewBoxSize: string =
		Platform.OS === "android"
			? `0 0 100 100`
			: `0 0 ${Constant.WINDOW_WIDTH} ${Constant.WINDOW_WIDTH}`;

	return props.isVisible ? (
		<View style={[styles.container, StyleSheet.absoluteFill]}>
			{Platform.OS === "android" ? (
				<Image
					source={{
						uri: `data:image/svg+xml;utf8,
							<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background:none; display: block; shape-rendering: auto;" viewBox="${viewBoxSize}" preserveAspectRatio="xMidYMid">
								<path xmlns="http://www.w3.org/2000/svg" class="a" d="m50 85c-19.4 0-35-15.6-35-35 0-19.4 15.6-35 35-35 19.4 0 35 15.6 35 35 0 19.4-15.6 35-35 35z" stroke="#c1f6ff" stroke-width="3" fill="none"/>
								<circle xmlns="http://www.w3.org/2000/svg" cx="50" cy="50" fill="none" stroke="${Colors.secondary}" stroke-width="3" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
									<animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"/>
								</circle>
								<path xmlns="http://www.w3.org/2000/svg" fill="${Colors.secondary}" class="a" d="m60 38.1c12.5 4.5 9.4-12.3 0 0m-0.8 1.4c-4.9 7.7-13.3 26.6-15.1 36.7l-4-3.9c2.6-10.3 12.3-25.7 17.7-33.4-36-10.8-22.7 26.4-7.6 4.5-6.2 13.7-14.7 14.4-18.2 9.7-5.4-7.1-0.8-24.8 26.8-15.5 2.7-3.2 4.6-4.6 6.5-5.3 7.2-2.4 8.4 8.8-1.8 8.1-1.3-0.1-2.7-0.5-4.3-0.9z"/>
							</svg>`,
					}}
					style={{ width: props.size || 70, height: props.size || 70 }}
				/>
			) : (
				<ActivityIndicator size="large" color={Colors.secondary} />
			)}
		</View>
	) : null;
};

export default AbsoluteLoader;
