import React, { useState } from "react";
import {
	StyleSheet,
	Text,
	View,
	ViewStyle,
	TouchableHighlight,
	Platform,
} from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEllipsisVertical } from "@fortawesome/pro-light-svg-icons/faEllipsisVertical";
import { faPenToSquare } from "@fortawesome/pro-light-svg-icons/faPenToSquare";
import { faShare } from "@fortawesome/pro-light-svg-icons/faShare";
import { faTrashCan } from "@fortawesome/pro-light-svg-icons/faTrashCan";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	onRename: () => void;
	onShare?: () => void;
	onDelete: () => void;
	folderId?: string;
};

const styles = StyleSheet.create({
	// container: {
	// 	flexDirection: "row",
	// 	alignItems: "center",
	// 	paddingLeft: 25,
	// },
	// locationTitle: {
	// 	fontFamily: "Roboto-Medium",
	// 	fontWeight: "500",
	// 	fontSize: 18,
	// 	color: Colors.primaryFont,
	// },
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

const DocumentActionMenu: React.FC<Props> = (props) => {
	const [isMenuOpen, toggleMenu] = useState<boolean>(false);

	const onOpenMenu = () => {
		toggleMenu(true);
	};

	const onCloseMenu = () => {
		toggleMenu(false);
	};

	const onPressRename = () => {
		toggleMenu(false);
		props.onRename();
	};

	const onPressShare = () => {
		toggleMenu(false);
		if (
			typeof props.onShare !== "undefined" &&
			typeof props.onShare === "function"
		) {
			props.onShare();
		}
	};

	const onPressDelete = () => {
		toggleMenu(false);
		props.onDelete();
	};

	return (
		<Menu
			visible={isMenuOpen}
			onRequestClose={onCloseMenu}
			anchor={
				<TouchableHighlight
					underlayColor={Colors.lightGrey}
					onPress={onOpenMenu}
					style={{ padding: 5, borderRadius: 100 }}
				>
					<FontAwesomeIcon
						size={18}
						icon={faEllipsisVertical}
						color={Colors.primaryFont}
					/>
				</TouchableHighlight>
			}
		>
			<MenuItem
				onPress={onPressRename}
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
					<Text style={styles.menuText}>{"Rename"}</Text>
				</View>
			</MenuItem>
			{typeof props.onShare !== "undefined" &&
			typeof props.onShare === "function" ? (
				<MenuItem
					onPress={onPressShare}
					style={styles.menu}
					textStyle={styles.menuItemText}
				>
					<View style={styles.menuItemRow}>
						<FontAwesomeIcon
							size={14}
							color={Colors.primaryFont}
							icon={faShare}
							style={styles.menuIcon}
						/>
						<Text style={styles.menuText}>{"Share"}</Text>
					</View>
				</MenuItem>
			) : null}

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
	);
};

export default DocumentActionMenu;
