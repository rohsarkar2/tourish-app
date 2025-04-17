import React from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
	backgroundColor: string;
	barStyle: "dark-content" | "light-content";
};

const CustomStatusBar: React.FC<Props> = (props) => {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={{
				height: insets.top,
				backgroundColor: props.backgroundColor,
			}}
		>
			<StatusBar
				animated={true}
				backgroundColor={props.backgroundColor}
				barStyle={props.barStyle}
			/>
		</View>
	);
};

export default CustomStatusBar;
