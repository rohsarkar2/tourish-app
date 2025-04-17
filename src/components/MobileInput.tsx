import React from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	View,
	FlatList,
	ViewStyle,
} from "react-native";
import Modal from "react-native-modal";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	countries: any[];
	callingCode: undefined | string;
	value: string;
	error: undefined | null | string;
	onChangeText: (value: string) => void;
	onChangeCountryCode: (value: string) => void;
	countryCodeError?: boolean;
	style?: ViewStyle;
};

type States = {
	searchValue: string;
	isFocused: boolean;
	isModalOpen: boolean;
	bottomBorderColor: string;
};

export default class MobileInput extends React.Component<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			searchValue: "",
			isFocused: false,
			isModalOpen: false,
			bottomBorderColor: Colors.mediumGrey,
		};
	}

	getCountries = () => {
		const { searchValue } = this.state;
		const { countries } = this.props;

		const data = countries.filter((element) => {
			let name = element.name.toLowerCase();
			let index = name.indexOf(searchValue.toLowerCase());
			return index > -1;
		});

		return data;
	};

	onFocus = () => this.setState({ isFocused: true });

	onBlur = () => this.setState({ isFocused: false });

	getBottomBorderColor = () => {
		this.props.error ? "rgb(213, 0, 0)" : this.state.bottomBorderColor;
	};

	onToggleCallingCode = () => {
		this.setState({ isModalOpen: !this.state.isModalOpen });
	};

	onSelectItem = (item: any) => {
		this.setState({ searchValue: "" });
		this.props.onChangeCountryCode(item.calling_code);
		this.onToggleCallingCode();
	};

	onSearch = (text: string) => {
		this.setState({ searchValue: text });
	};

	keyExtractor = (item: any) => item._id;

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
						+ {item.calling_code} ({item.name})
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	);

	render = () => (
		<>
			<View
				style={[
					styles.container,
					this.props.style,
					{
						borderBottomColor: this.state.isFocused
							? Colors.primary
							: this.props.error
							? Colors.danger
							: Colors.mediumGrey,
					},
				]}
			>
				{this.props.value ? (
					<Text style={styles.label}>{LocalizedText.MOBILE}</Text>
				) : null}

				{typeof this.props.callingCode !== "undefined" ? (
					<TouchableHighlight
						onPress={this.onToggleCallingCode}
						style={styles.callingCodeBox}
						underlayColor={Colors.lightGrey}
					>
						<>
							<Text style={styles.callingCodeText}>
								{`+ ${this.props.callingCode}`}
							</Text>
							<FontAwesomeIcon
								icon={faChevronDown}
								size={20}
								color={Colors.mediumGrey}
								style={{ marginHorizontal: 3 }}
							/>
						</>
					</TouchableHighlight>
				) : null}

				<TextInput
					{...this.props}
					value={this.props.value}
					autoCapitalize="none"
					autoComplete="off"
					keyboardType="number-pad"
					placeholder={LocalizedText.MOBILE}
					placeholderTextColor={
						this.props.error ? Colors.danger : Colors.placeholderTextColor
					}
					style={[
						styles.input,
						this.props.callingCode ? { width: "88%", paddingLeft: 0 } : null,
					]}
					onChangeText={this.props.onChangeText}
					onFocus={this.onFocus}
					onBlur={this.onBlur}
				/>
			</View>
			{this.props.error !== null ? (
				<Text style={{ color: Colors.danger, fontSize: 12, marginTop: 2 }}>
					{this.props.error}
				</Text>
			) : null}

			{this.props.countryCodeError ? (
				<Text style={{ color: Colors.danger, fontSize: 12, marginTop: 2 }}>
					Select country calling code
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
				onBackButtonPress={this.onToggleCallingCode}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.heading}>{"Select your country code"}</Text>
						<TouchableHighlight
							style={{
								position: "absolute",
								right: 8,
								padding: 5,
								borderRadius: 90,
							}}
							onPress={this.onToggleCallingCode}
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
						// data={this.props.countries}
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
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 45,
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
	},
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
	callingCodeBox: {
		width: "22%",
		height: 45,
		// alignItems: "flex-start",
		alignItems: "flex-end",
		justifyContent: "space-between",
		paddingBottom: 8,
		flexDirection: "row",
		paddingHorizontal: 5,
	},
	callingCodeText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.mediumGrey,
		fontSize: 14,
	},
	input: {
		borderWidth: 0,
		height: 45,
		width: "100%",
		paddingLeft: 0,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		paddingBottom: 0,
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
		marginHorizontal: 5,
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
