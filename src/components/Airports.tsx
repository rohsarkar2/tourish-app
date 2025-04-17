import React from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TextInput,
	TouchableHighlight,
	ActivityIndicator,
	Keyboard,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/pro-light-svg-icons/faChevronRight";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faPlaneDeparture } from "@fortawesome/pro-light-svg-icons/faPlaneDeparture";
import NoResult from "./NoResult";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import { debounce } from "../utils/Util";
import { searchAirport } from "../services/ApiService";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	onItemSelect: (item: any) => void;
};

type States = {
	searchValue: string;
	airports: any[];
	isModalOpen: boolean;
	isSearching: boolean;
	isDataFetched: boolean;
};

export default class Airports extends React.PureComponent<Props, States> {
	private textinputRef: React.RefObject<TextInput>;

	constructor(props: Props) {
		super(props);

		this.state = {
			searchValue: "",
			airports: [],
			isModalOpen: false,
			isSearching: false,
			isDataFetched: false,
		};

		this.textinputRef = React.createRef();
	}

	openModal = () => {
		this.setState({
			searchValue: "",
			airports: [],
			isModalOpen: true,
			isSearching: false,
			isDataFetched: false,
		});
		setTimeout(() => {
			this.textinputRef && this.textinputRef.current?.focus();
		}, 600);
	};

	closeModal = () => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false });
	};

	selectItem = (item: any) => {
		Keyboard.dismiss();
		this.setState({ searchValue: "", isModalOpen: false }, () => {
			this.props.onItemSelect({
				id: item._id,
				name: item.name,
				iata_code: item.iata_code,
				city_id: item.city._id,
				city_name: item.city.name,
				country_id: item.country._id,
				country_name: item.country.name,
				currency: item.country.currency,
				service_types: item.service_types,
				isOnBoard: item.isOnBoard,
			});
		});
	};

	setSearchValue = (text: string) => {
		this.setState({ searchValue: text }, () => {
			let { searchValue } = this.state;

			if (searchValue.trim().length > 2) {
				const searchMethod = debounce(this.serachData.bind(this, searchValue));
				searchMethod();
			} else {
				this.setState({ isDataFetched: false, airports: [] });
			}
		});
	};

	serachData = (text: string) => {
		this.setState({ isSearching: true, isDataFetched: false }, () => {
			searchAirport(text)
				.then((data) => {
					this.setState({
						isSearching: false,
						isDataFetched: true,
						airports: data,
					});
				})
				.catch((error) => {
					this.setState({
						isSearching: false,
						isDataFetched: true,
					});
				});
		});
	};

	render = () => (
		<Modal
			isVisible={this.state.isModalOpen}
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
					<Text style={styles.heading}>{LocalizedText.AIRPORTS}</Text>
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

				<View style={{ paddingHorizontal: 15 }}>
					<View style={styles.searchContainer}>
						<View style={styles.searchIconBox}>
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								size={16}
								color={Colors.mediumGrey}
							/>
						</View>
						<TextInput
							ref={this.textinputRef}
							value={this.state.searchValue}
							autoCapitalize="none"
							placeholder={`${LocalizedText.SEARCH}...`}
							placeholderTextColor={Colors.lightFont}
							style={styles.searchField}
							onChangeText={this.setSearchValue}
						/>
						<View style={styles.loaderBox}>
							{this.state.isSearching ? (
								<ActivityIndicator size="small" color={Colors.mediumGrey} />
							) : null}
						</View>
					</View>
				</View>

				{this.state.isDataFetched ? (
					<FlatList
						keyboardShouldPersistTaps="handled"
						data={this.state.airports}
						renderItem={this.renderItem}
						keyExtractor={(item) => item._id}
						showsVerticalScrollIndicator={false}
						initialNumToRender={this.state.airports.length}
						ListEmptyComponent={this.getListEmptyComponent.bind(this)}
						contentContainerStyle={
							this.state.airports.length <= 0 ? { flex: 1 } : null
						}
					/>
				) : null}
			</View>
		</Modal>
	);

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			style={{ flex: 0.3 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			underlayColor={Colors.lightGrey}
			onPress={this.selectItem.bind(this, item)}
			style={{ marginHorizontal: 15 }}
		>
			<View style={styles.itemContainer}>
				<View style={styles.itemIconContainer}>
					<FontAwesomeIcon
						icon={faPlaneDeparture}
						size={25}
						color={Colors.mediumGrey}
					/>
				</View>
				<View
					style={{
						width: "80%",
						justifyContent: "center",
					}}
				>
					<Text style={styles.airportName}>
						{item.name + " (" + item.iata_code + ")"}
					</Text>
				</View>
				<View style={[styles.itemIconContainer, { alignItems: "flex-end" }]}>
					<FontAwesomeIcon
						icon={faChevronRight}
						size={18}
						color={Colors.mediumGrey}
					/>
				</View>
			</View>
		</TouchableHighlight>
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
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.75),
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
	searchContainer: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 5,
		paddingHorizontal: 6,
		marginBottom: 8,
	},
	searchIconBox: {
		width: "8%",
		alignItems: "center",
		justifyContent: "center",
	},
	searchField: {
		height: 38,
		width: "82%",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	loaderBox: {
		width: "10%",
		alignItems: "center",
		justifyContent: "center",
	},
	itemContainer: {
		flexDirection: "row",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	itemIconContainer: {
		width: "10%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	airportName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		lineHeight: 20,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
});
