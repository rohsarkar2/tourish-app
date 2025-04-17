import React from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableHighlight,
	ViewStyle,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import Modal from "react-native-modal";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";

type Props = {
	isVisible: boolean;
	title: string;
	children: React.ReactNode;
	onClose: () => void;
	style?: ViewStyle | Array<ViewStyle>;
};

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.7),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
});

const BottomSheet: React.FC<Props> = (props) => (
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
		animationOutTiming={200}
		animationOut="fadeOut"
		backdropTransitionOutTiming={200}
		onBackButtonPress={props.onClose}
	>
		<View style={[styles.modalContainer, props.style]}>
			<View style={styles.modalHeader}>
				<Text style={styles.heading}>{props.title}</Text>
				<TouchableHighlight
					style={{
						position: "absolute",
						right: 8,
						padding: 5,
						borderRadius: 90,
					}}
					onPress={props.onClose}
					underlayColor={Colors.lightGrey}
				>
					<FontAwesomeIcon icon={faXmark} size={20} color={Colors.mediumGrey} />
				</TouchableHighlight>
			</View>
			{props.children}
		</View>
	</Modal>
);

export default BottomSheet;
