import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	FlatList,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlaneUp } from "@fortawesome/pro-light-svg-icons/faPlaneUp";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import NoResult from "./NoResult";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	isVisible: boolean;
	airports: any[];
	onAirportSelect: (item: any) => void;
	onClose: () => void;
};

export default class JourneyAirportList extends React.Component<Props> {
	selectAirport = (item: any) => {
		const { onAirportSelect } = this.props;
		if (
			typeof onAirportSelect !== "undefined" &&
			typeof onAirportSelect === "function"
		) {
			onAirportSelect(item);
		}
	};

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				onPress={this.selectAirport.bind(this, item)}
			>
				<View style={styles.row}>
					<FontAwesomeIcon
						icon={faPlaneUp}
						size={22}
						color={Colors.secondary}
						style={{ marginRight: 10, marginTop: 2 }}
					/>

					<View style={{ flex: 1 }}>
						<Text style={styles.airportTitle}>
							{item.name}
							<Text style={styles.airportCode}>{` (${item.iata_code})`}</Text>
						</Text>
						<Text style={styles.airportCity}>
							{`${item.city.name}, ${item.country.name}`}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			description={LocalizedText.PAGE_NOT_FOUND}
			style={{ flex: 0.5 }}
			titleStyle={{ fontSize: 16, marginBottom: 15 }}
		/>
	);

	render = () => (
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
			animationOutTiming={200}
			animationOut="fadeOut"
			backdropTransitionOutTiming={200}
			onBackButtonPress={this.props.onClose}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<Text style={styles.heading}>{LocalizedText.AIRPORTS}</Text>
					<TouchableHighlight
						style={styles.modalCloseBtn}
						onPress={this.props.onClose}
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
					data={this.props.airports}
					renderItem={this.renderItem}
					keyExtractor={this.keyExtractor}
					initialNumToRender={20}
					maxToRenderPerBatch={20}
					removeClippedSubviews={true}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps={"handled"}
					ListEmptyComponent={this.getListEmptyComponent.bind(this)}
					contentContainerStyle={
						this.props.airports.length <= 0 ? { flex: 1 } : null
					}
				/>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.7),
		width: Constant.WINDOW_WIDTH,
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalHeader: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 22,
		lineHeight: 30,
		color: Colors.primaryFont,
	},
	row: {
		width: "100%",
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 15,
	},
	airportTitle: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		fontWeight: "400",
		opacity: 0.9,
	},
	airportCode: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontSize: 14,
		fontWeight: "500",
		opacity: 0.9,
	},
	airportCity: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 12,
		fontWeight: "400",
		marginTop: 3,
		opacity: 0.8,
	},
	modalCloseBtn: {
		position: "absolute",
		right: 8,
		padding: 5,
		borderRadius: 90,
	},
});
