import React from "react";
import {
	Text,
	View,
	Image,
	StyleSheet,
	Platform,
	StatusBar,
} from "react-native";
import Modal from "react-native-modal";
import Button from "./Button";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Constant.SCREEN_HEIGHT,
		backgroundColor: Colors.white,
		alignItems: "center",
		justifyContent: "center",
	},
	modalBody: {
		width: "100%",
		backgroundColor: Colors.white,
		...Platform.select({
			ios: { height: Constant.SCREEN_HEIGHT - 50 },
			android: {
				height: Constant.SCREEN_HEIGHT - Number(StatusBar.currentHeight),
			},
			default: { height: Constant.SCREEN_HEIGHT - 50 },
		}),
	},
	appIconContainer: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	infoContainer: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 20,
		paddingTop: 0,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 25,
		color: Colors.primaryFont,
		textAlign: "center",
	},
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		marginTop: 10,
		textAlign: "center",
		opacity: 0.9,
	},
});

type Props = {
	isVisible: boolean;
	latestVersion: string | null;
	onUpdate: () => void;
};

const AppUpdateModal: React.FC<Props> = (props) => {
	return (
		<Modal
			isVisible={props.isVisible}
			statusBarTranslucent={true}
			useNativeDriver={true}
			useNativeDriverForBackdrop={true}
			hideModalContentWhileAnimating={true}
			deviceHeight={Constant.SCREEN_HEIGHT}
			deviceWidth={Constant.SCREEN_WIDTH}
			style={styles.modalOverlay}
			backdropColor={"rgba(0,0,0,0.5)"}
			backdropOpacity={1}
			onBackButtonPress={undefined}
			animationIn="slideInRight"
			animationOut="fadeOut"
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalBody}>
					<View style={styles.appIconContainer}>
						<Image
							resizeMode="contain"
							source={require("../assets/images/logo.png")}
							style={{ width: 200 }}
						/>
					</View>
					<View style={styles.infoContainer}>
						<View>
							<Text style={styles.heading}>{"Time To Update"}</Text>
							{props.latestVersion ? (
								<Text style={styles.descText}>
									{`New version ${props.latestVersion} is available now. Please update with the latest one to make your experience as smooth as possible.`}
								</Text>
							) : null}
						</View>
						<Button title="UPDATE" onPress={props.onUpdate} />
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default AppUpdateModal;
