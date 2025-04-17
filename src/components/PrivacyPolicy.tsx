import React from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
	StatusBar,
} from "react-native";
import Modal from "react-native-modal";
import { WebView } from "react-native-webview";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons/faArrowLeft";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import Loader from "./Loader";

type Props = {
	isVisible: boolean;
	onClose: () => void;
};

export default class PrivacyPolicy extends React.Component<Props, any> {
	onClose = () => {
		this.props.onClose();
	};

	render = () => {
		return (
			<Modal
				isVisible={this.props.isVisible}
				statusBarTranslucent={true}
				useNativeDriver={true}
				useNativeDriverForBackdrop={true}
				hideModalContentWhileAnimating={true}
				deviceHeight={Constant.SCREEN_HEIGHT}
				deviceWidth={Constant.SCREEN_WIDTH}
				style={styles.modalOverlay}
				backdropColor={"rgba(0,0,0,0.5)"}
				backdropOpacity={1}
				onBackButtonPress={this.onClose}
				animationIn="slideInRight"
				animationOut="fadeOut"
				animationOutTiming={200}
			>
				<View style={styles.modalContainer}>
					<View
						style={{
							width: "100%",
							height: Platform.OS === "android" ? StatusBar.currentHeight : 50,
							backgroundColor: Colors.secondary,
						}}
					/>
					<View style={styles.header}>
						<TouchableOpacity
							activeOpacity={0.5}
							style={styles.headerLeft}
							onPress={this.onClose}
						>
							<FontAwesomeIcon
								size={25}
								icon={faArrowLeft}
								color={Colors.white}
							/>
						</TouchableOpacity>

						<View style={[styles.headerMiddle]}>
							<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
								{"Privacy Policy"}
							</Text>
						</View>
					</View>

					<WebView
						source={{ uri: "https://tourish.market/Privacy-Policy.html" }}
						showsVerticalScrollIndicator={false}
						startInLoadingState={true}
						incognito={true}
						renderLoading={() => <Loader />}
						injectedJavaScript={`document.body.style.userSelect = 'none'`}
						style={{
							flex: 1,
							width: Constant.WINDOW_WIDTH - 10,
							marginHorizontal: 5,
							marginTop: 5,
						}}
					/>
				</View>
			</Modal>
		);
	};
}

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		backgroundColor: Colors.white,
	},
	header: {
		paddingHorizontal: 10,
		height: 50,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.primaryBg,
	},
	headerLeft: {
		width: "15%",
		height: "100%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	headerMiddle: {
		width: "65%",
		height: "100%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	title: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 20,
		color: Colors.white,
		lineHeight: 24,
		marginBottom: 3,
	},
});
