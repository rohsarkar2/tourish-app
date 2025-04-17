import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ViewStyle,
	TouchableOpacity,
	Platform,
} from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleEllipsisVertical } from "@fortawesome/pro-solid-svg-icons/faCircleEllipsisVertical";
import { faPenToSquare } from "@fortawesome/pro-light-svg-icons/faPenToSquare";
import { faPlaneUp } from "@fortawesome/pro-light-svg-icons/faPlaneUp";
import { faTrashCan } from "@fortawesome/pro-light-svg-icons/faTrashCan";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	name: string;
	onEdit: () => void;
	onDelete: () => void;
	onOpenAirports: () => void | undefined;
	style?: ViewStyle | Array<ViewStyle>;
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 25,
		borderRadius: 4,
		backgroundColor: "rgba(21, 189, 216, 0.2)",
		justifyContent: "space-between",
	},
	locationTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		color: Colors.primaryFont,
	},
	menu: {
		height: 35,
		padding: 10,
		width: "auto",
		minWidth: 100,
	},
	menuItemText: {
		paddingHorizontal: 0,
		paddingVertical: 0,
		alignSelf: "flex-start",
	},
	menuItemRow: {
		flexDirection: "row",
		alignItems: "center",
		...Platform.select({ ios: { height: 22 } }),
	},
	menuIcon: {
		marginRight: 10,
	},
	menuText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.primaryFont,
	},
});

const TourLocation: React.FC<Props> = (props) => {
	const [isMenuOpen, toggleMenu] = useState<boolean>(false);

	const onOpenMenu = () => {
		toggleMenu(true);
	};

	const onCloseMenu = () => {
		toggleMenu(false);
	};

	const onPressEdit = () => {
		toggleMenu(false);
		props.onEdit();
	};

	const onPressAirports = () => {
		toggleMenu(false);
		props.onOpenAirports();
	};

	const onPressDelete = () => {
		toggleMenu(false);
		props.onDelete();
	};

	return (
		<View style={styles.container}>
			<Text style={styles.locationTitle}>{props.name}</Text>
			<Menu
				visible={isMenuOpen}
				onRequestClose={onCloseMenu}
				anchor={
					<TouchableOpacity style={{ padding: 5 }} onPress={onOpenMenu}>
						<FontAwesomeIcon
							size={18}
							color={Colors.secondaryBg}
							icon={faCircleEllipsisVertical}
						/>
					</TouchableOpacity>
				}
			>
				<MenuItem
					onPress={onPressEdit}
					style={styles.menu}
					textStyle={styles.menuItemText}
				>
					<View style={styles.menuItemRow}>
						<FontAwesomeIcon
							size={14}
							color={Colors.primaryFont}
							icon={faPenToSquare}
							style={styles.menuIcon}
						/>
						<Text style={styles.menuText}>{LocalizedText.EDIT}</Text>
					</View>
				</MenuItem>
				<MenuItem
					onPress={onPressAirports}
					style={styles.menu}
					textStyle={styles.menuItemText}
				>
					<View style={styles.menuItemRow}>
						<FontAwesomeIcon
							size={14}
							color={Colors.primaryFont}
							icon={faPlaneUp}
							style={styles.menuIcon}
						/>
						<Text style={styles.menuText}>{LocalizedText.AIRPORTS}</Text>
					</View>
				</MenuItem>
				<MenuItem
					onPress={onPressDelete}
					style={styles.menu}
					textStyle={styles.menuItemText}
				>
					<View style={styles.menuItemRow}>
						<FontAwesomeIcon
							size={14}
							color={Colors.primaryFont}
							icon={faTrashCan}
							style={styles.menuIcon}
						/>
						<Text style={styles.menuText}>{LocalizedText.DELETE}</Text>
					</View>
				</MenuItem>
			</Menu>
		</View>
	);
};

export default TourLocation;
