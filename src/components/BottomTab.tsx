import React from "react";
import {
	StyleSheet,
	View,
	TouchableOpacity,
	Dimensions,
	Platform,
} from "react-native";
import {
	ParamListBase,
	TabNavigationState,
	NavigationHelpers,
} from "@react-navigation/native";
import { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHouse } from "@fortawesome/pro-light-svg-icons/faHouse";
import { faMap } from "@fortawesome/pro-light-svg-icons/faMap";
import { faUser } from "@fortawesome/pro-light-svg-icons/faUser";
import Ripple from "react-native-material-ripple";
import Colors from "../configs/Colors";

const winWidth = Dimensions.get("window").width;
const styles = StyleSheet.create({
	container: {
		position: "absolute",
		bottom: 12,
		flexDirection: "row",
		marginHorizontal: 20,
		width: winWidth - 40,
		height: 50,
		backgroundColor: Colors.white,
		paddingHorizontal: 10,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "space-between",
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
	tabBtn: {
		width: 50,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 100,
	},
});

type TabBarProps = {
	state: TabNavigationState<ParamListBase>;
	descriptors: any;
	navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
};

const getTabIcons = (routeName: string): any => {
	switch (routeName) {
		case "Home":
			return faHouse;
			break;
		case "Journey":
			return faMap;
			break;
		case "Account":
			return faUser;
		default:
			break;
	}
};

const BottomTab = ({ state, descriptors, navigation }: TabBarProps) => {
	return (
		<View style={styles.container}>
			{state.routes.map((route, index) => {
				let { options } = descriptors[route.key];
				let isFocused = state.index === index;

				const onPress = () => {
					if (!isFocused) {
						navigation.navigate(route.name);
					}
				};

				return (
					<Ripple
						key={route.key}
						rippleColor={Colors.rippleColor}
						rippleDuration={550}
						rippleOpacity={0.54}
						rippleContainerBorderRadius={25}
						onPress={onPress}
						style={styles.tabBtn}
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarTestID}
					>
						<FontAwesomeIcon
							size={20}
							icon={getTabIcons(route.name)}
							color={isFocused ? Colors.primaryBtn : Colors.mediumGrey}
						/>
					</Ripple>
				);
			})}
		</View>
	);
};

export default BottomTab;
