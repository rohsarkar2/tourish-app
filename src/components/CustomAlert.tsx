import React from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Linking,
	ViewStyle,
} from "react-native";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";

type Props = {
	isVisible: boolean;
	title: string;
	messageParts: { text: string; link?: string; linkText?: string }[];
	onCancel: () => void;
	onConfirm?: (item?: any) => void;
	buttonContainerStyle?: ViewStyle | Array<ViewStyle>;
	canceBtnstyle?: ViewStyle | Array<ViewStyle>;
	canceBtnTextstyle?: ViewStyle | Array<ViewStyle>;
};

const CustomAlert: React.FC<Props> = (props: Props) => {
	const handleLinkPress = (link: any) => {
		Linking.openURL(link);
	};
	return (
		<Modal
			transparent={true}
			animationType="slide"
			visible={props.isVisible}
			onRequestClose={props.onCancel}
			statusBarTranslucent={true}
		>
			<View style={styles.modalBackground}>
				<View style={styles.alertBox}>
					<Text style={styles.title}>{props.title}</Text>
					<Text style={styles.message}>
						{props.messageParts.map((part, index) =>
							part.link ? (
								<Text
									key={index}
									style={styles.link}
									onPress={() => handleLinkPress(part.link)}
								>
									{part.linkText || "Click here"}
								</Text>
							) : (
								<Text key={index}>{part.text}</Text>
							)
						)}
					</Text>
					{typeof props.buttonContainerStyle !== "undefined" ? (
						<View style={styles.buttonContainer || props.buttonContainerStyle}>
							<TouchableOpacity
								style={styles.cancelButton || props.canceBtnstyle}
								onPress={props.onCancel}
							>
								<Text
									style={styles.cancelButtonText || props.canceBtnTextstyle}
								>
									{LocalizedText.BACK}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								activeOpacity={0.9}
								style={styles.button}
								onPress={props.onConfirm}
							>
								<Text style={styles.buttonText}>{LocalizedText.I_ACCEPT}</Text>
							</TouchableOpacity>
						</View>
					) : (
						<TouchableOpacity
							style={props.canceBtnstyle}
							onPress={props.onCancel}
						>
							<Text style={styles.cancelButtonText || props.canceBtnTextstyle}>
								{LocalizedText.OK}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		</Modal>
	);
};

export default CustomAlert;

const styles = StyleSheet.create({
	modalBackground: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	alertBox: {
		width: 300,
		padding: 20,
		backgroundColor: Colors.white,
		borderRadius: 10,
		alignItems: "center",
	},
	title: {
		fontSize: 20,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		marginBottom: 10,
		color: Colors.lightFont,
	},
	message: {
		fontSize: 16,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		lineHeight: 24,
		marginBottom: 20,
		color: Colors.secondaryFont,
	},
	link: {
		color: Colors.primary,
		textDecorationLine: "underline",
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	cancelButton: {
		flex: 1,
		padding: 10,
		marginHorizontal: 5,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: Colors.primaryBg,
	},
	cancelButtonText: {
		color: Colors.primaryBg,
		textAlign: "center",
		fontSize: 16,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
	},
	button: {
		flex: 1,
		padding: 10,
		marginHorizontal: 5,
		borderRadius: 5,
		backgroundColor: Colors.primaryBg,
	},
	buttonText: {
		color: Colors.white,
		textAlign: "center",
		fontSize: 16,
	},
});
