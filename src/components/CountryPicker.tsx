import React from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TextInput,
	TouchableOpacity,
	TouchableHighlight,
	Keyboard,
	Image,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";

type Props = {
	countries: any[];
	placeholder: string;
	selectedCountryID: string | undefined;
	selectedCountryName: string;
	error: string | null | undefined;
	onSelectCountry: (item: any) => void;
};

type States = {
	searchValue: string;
	isModalOpen: boolean;
};

export default class CountryPicker extends React.PureComponent<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			searchValue: "",
			isModalOpen: false,
		};
	}

	getSelectedCountryName = () => {
		const { selectedCountryID, countries } = this.props;
		let countryName = undefined;
		const index = countries.findIndex(
			(item: any) => item._id === selectedCountryID
		);
		if (index > -1) {
			const country = countries[index];
			countryName = country.name;
		}
		return countryName;
	};

	openModal = () => {
		this.setState({
			searchValue: "",
			isModalOpen: true,
		});
	};

	closeModal = () => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false });
	};

	onSearch = (text: string) => {
		this.setState({ searchValue: text });
	};

	getCountries = () => {
		const { searchValue } = this.state;
		const { countries } = this.props;

		const data = countries.filter((element: any) => {
			let name = element.name.toLowerCase();
			let index = name.indexOf(searchValue.toLowerCase());
			return index > -1;
		});

		return data;
	};

	onSelectItem = (item: any) => {
		Keyboard.dismiss();
		this.setState({ searchValue: "", isModalOpen: false }, () => {
			const { onSelectCountry } = this.props;
			if (
				typeof onSelectCountry !== "undefined" &&
				typeof onSelectCountry === "function"
			) {
				onSelectCountry(item);
			}
		});
	};

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			underlayColor={Colors.lightGrey}
			onPress={this.onSelectItem.bind(this, item)}
			style={{
				height: 55,
				borderBottomWidth: 1,
				borderBottomColor: Colors.lightBorder,
			}}
		>
			<View style={styles.itemContainer}>
				<View style={styles.flagContainer}>
					<Image
						source={{ uri: item.flag }}
						resizeMode="cover"
						style={{ height: 20, width: 30 }}
					/>
				</View>
				<View
					style={{
						width: "85%",
						justifyContent: "center",
					}}
				>
					<Text
						style={styles.countryName}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{item.name}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	);

	keyExtractor = (item: any) => item._id;

	render = () => {
		const { selectedCountryID } = this.props;
		return (
			<>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={this.openModal}
					style={[
						styles.dropdown,
						this.props.error
							? { borderBottomColor: Colors.danger, marginBottom: 0 }
							: null,
					]}
				>
					<TextInput
						editable={false}
						multiline={false}
						value={this.props.selectedCountryName}
						placeholder={this.props.placeholder}
						placeholderTextColor={
							this.props.error ? Colors.danger : Colors.placeholderTextColor
						}
						style={styles.dropdownInput}
					/>

					<View style={styles.dropdownCaret}>
						<FontAwesomeIcon
							icon={faChevronDown}
							size={18}
							color={this.props.error ? Colors.danger : Colors.mediumGrey}
						/>
					</View>
					{typeof selectedCountryID === "string" &&
					selectedCountryID.length > 0 ? (
						<Text style={styles.label}>{"Country"}</Text>
					) : null}
				</TouchableOpacity>

				{this.props.error ? (
					<Text
						style={{
							color: Colors.danger,
							fontSize: 12,
							marginTop: 2,
							marginBottom: 5,
						}}
					>
						{this.props.error}
					</Text>
				) : null}

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
					animationInTiming={250}
					animationOutTiming={250}
					onBackButtonPress={this.closeModal}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.heading}>{"Select your country"}</Text>
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

						<View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
							<View style={styles.searchContainer}>
								<View style={styles.searchIconBox}>
									<FontAwesomeIcon
										icon={faMagnifyingGlass}
										size={16}
										color={Colors.mediumGrey}
									/>
								</View>
								<TextInput
									value={this.state.searchValue}
									autoCapitalize="none"
									placeholder="Search..."
									placeholderTextColor={Colors.lightFont}
									style={styles.searchField}
									onChangeText={this.onSearch}
								/>
							</View>
						</View>

						<FlatList
							data={this.getCountries()}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							initialNumToRender={50}
							maxToRenderPerBatch={50}
							removeClippedSubviews={true}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{ paddingHorizontal: 15 }}
						/>
					</View>
				</Modal>
			</>
		);
	};
}

const styles = StyleSheet.create({
	label: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.primary,
		// color: Colors.lightFont,
		// opacity: 0.6,
		position: "absolute",
		top: -3,
	},
	dropdown: {
		height: 45,
		width: "100%",
		flexDirection: "row",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.mediumGrey,
	},
	dropdownInput: {
		width: "90%",
		height: "100%",
		paddingLeft: 0,
		paddingBottom: 5,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
	},
	dropdownCaret: {
		width: "10%",
		alignItems: "flex-end",
		justifyContent: "center",
	},
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
		height: "100%",
		flexDirection: "row",
		// paddingVertical: 10,
		// borderBottomWidth: 1,
		// borderBottomColor: Colors.lightBorder,
	},
	flagContainer: {
		width: "15%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	countryName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 15,
		lineHeight: 20,
		color: Colors.secondaryFont,
	},
});
