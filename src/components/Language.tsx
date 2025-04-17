import React, { Component } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	isVisible: boolean;
	onChange: (item: any) => void;
	onClose: () => void;
};

type States = {
	searchValue: string;
	availableLanguages: Array<{ code: string; name: string }>;
};

export default class Language extends Component<Props, States> {
	constructor(props: Props) {
		super(props);
		this.state = {
			searchValue: "",
			availableLanguages: Constant.AVAILABLE_LANGUAGES,
		};
	}

	selectItem = (item: any) => {
		const { onChange } = this.props;
		if (typeof onChange !== "undefined" && typeof onChange === "function") {
			onChange(item);
		}
	};

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			underlayColor={Colors.lightGrey}
			style={styles.itemContainer}
			onPress={this.selectItem.bind(this, item)}
		>
			<>
				<View style={styles.codeBox}>
					<Text style={styles.languageCode}>{item.code.toUpperCase()}</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.language} numberOfLines={1} ellipsizeMode="tail">
						{item.name}
					</Text>
				</View>
			</>
		</TouchableHighlight>
	);

	closeModal = () => {
		const { onClose } = this.props;
		if (typeof onClose !== "undefined" && typeof onClose === "function") {
			onClose();
		}
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
				animationInTiming={500}
				animationOutTiming={500}
				onBackButtonPress={this.closeModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.heading}>{LocalizedText.CHANGE_LANGUAGE}</Text>
						<TouchableHighlight
							style={{
								position: "absolute",
								right: 8,
								padding: 5,
								borderRadius: 90,
							}}
							onPress={this.closeModal}
							underlayColor={Colors.lightGrey}
						>
							<FontAwesomeIcon
								icon={faXmark}
								size={20}
								color={Colors.mediumGrey}
							/>
						</TouchableHighlight>
					</View>

					<FlatList
						data={this.state.availableLanguages}
						renderItem={this.renderItem}
						keyExtractor={(item) => item.code}
						numColumns={2}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						initialNumToRender={this.state.availableLanguages.length}
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
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.5),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 15,
		paddingTop: 15,
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
	itemContainer: {
		height: 55,
		width: Math.floor((Constant.WINDOW_WIDTH - 90) / 2),
		margin: 15,
		flexDirection: "row",
		alignItems: "center",
		padding: 8,
		borderWidth: 1,
		borderRadius: 8,
		borderColor: Colors.lightBorder,
	},
	codeBox: {
		height: 35,
		width: 35,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.secondaryAlpha2,
		marginRight: 8,
	},
	languageCode: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.secondary,
		letterSpacing: 1,
	},
	language: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
	},
});
