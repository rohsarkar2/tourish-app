import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons/faArrowLeft";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	onClose?: () => void;
};

export default class PageNotFound extends React.Component<Props> {
	render = () => {
		return (
			<View style={styles.container}>
				<Image
					source={require("../assets/images/coming-soon.png")}
					resizeMode="cover"
					style={{ height: 150, width: 150, marginBottom: 20 }}
				/>
				<Text style={styles.text}>{LocalizedText.PAGE_NOT_FOUND}</Text>
				<TouchableOpacity onPress={this.props.onClose} style={styles.backBtn}>
					<FontAwesomeIcon
						size={15}
						icon={faArrowLeft}
						color={Colors.primaryBtn}
					/>
					<Text style={styles.backBtnText}>{"Back"}</Text>
				</TouchableOpacity>
			</View>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 15,
	},
	text: {
		fontWeight: "400",
		fontFamily: "Robot-Regular",
		fontSize: 14,
		color: Colors.secondaryFont,
		textAlign: "center",
		lineHeight: 20,
	},
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 15,
		padding: 8,
	},
	backBtnText: {
		fontWeight: "500",
		fontFamily: "Robot-Medium",
		fontSize: 14,
		color: Colors.primaryBtn,
		lineHeight: 25,
		marginLeft: 5,
	},
});
