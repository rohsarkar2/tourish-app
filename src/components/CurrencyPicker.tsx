import React, { Component } from "react";
import {
	FlatList,
	Keyboard,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faCircleDollar } from "@fortawesome/pro-solid-svg-icons/faCircleDollar";
import { faAngleRight } from "@fortawesome/pro-regular-svg-icons/faAngleRight";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import NoResult from "./NoResult";
import LocalizedText from "../resources/LocalizedText";
import BottomSheet from "./BottomSheet";

type Props = {
	currencies: Array<any>;
	selectedCurrency?: null | {
		name: string;
		code: string;
		decimal_point: number;
	};
	onSelect: (item: any) => void;
	error?: string | null | undefined;
	style?: ViewStyle | Array<ViewStyle>;
	variant: "DROPDOWN" | "MENULIST";
	value?: string;
};

type States = {
	searchValue: string;
	isModalOpen: boolean;
};

class CurrencyPicker extends Component<Props, States> {
	constructor(props: Props) {
		super(props);
		this.state = {
			searchValue: "",
			isModalOpen: false,
		};
	}

	getCurrency = () => {
		let filterData = this.props?.currencies?.filter((element) => {
			let currencyName = element.name.toLowerCase();
			let currencyCode = element.code.toLowerCase();
			let searchValue = this.state.searchValue.toLowerCase();
			return (
				currencyName.includes(searchValue) || currencyCode.includes(searchValue)
			);
		});
		return filterData;
	};

	onSearch = (searchValue: string) => {
		this.setState({ searchValue });
	};

	selectItem = (currency: any) => {
		Keyboard.dismiss();
		this.setState({ searchValue: "", isModalOpen: false }, () => {
			const { onSelect } = this.props;
			if (typeof onSelect !== "undefined" && typeof onSelect === "function") {
				onSelect(currency);
			}
		});
	};

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				onPress={this.selectItem.bind(this, item)}
				key={item._id}
			>
				<View style={styles.itemContainer}>
					<View style={styles.symbolBox}>
						<Text style={styles.symbol}>{item.code}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.currency}>{item.name}</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			style={{ flex: 0.3 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	openModal = () => {
		this.setState({
			searchValue: "",
			isModalOpen: true,
		});
	};

	closeModal = () => {
		Keyboard.dismiss();
		this.setState({ searchValue: "", isModalOpen: false });
	};

	render = () => {
		const { selectedCurrency } = this.props;
		const { variant } = this.props;
		return (
			<>
				{variant === "DROPDOWN" ? (
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
								value={selectedCurrency !== null ? selectedCurrency?.name : ""}
								placeholder="Currency"
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

							{selectedCurrency !== null ? (
								<Text style={styles.label}>{"Currency"}</Text>
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
					</>
				) : (
					<TouchableHighlight
						onPress={this.openModal}
						underlayColor={Colors.lightGrey}
						style={[styles.userMenuList, this.props.style]}
					>
						<>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								<View style={styles.iconStyle}>
									<FontAwesomeIcon
										size={22}
										icon={faCircleDollar}
										color={Colors.secondaryBtn}
									/>
								</View>
								<Text
									style={{
										marginLeft: 15,
										fontSize: 14,
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										color: Colors.secondaryFont,
										opacity: 0.8,
									}}
								>
									{LocalizedText.DEFAULT_CURRENCY}
								</Text>
							</View>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Text
									style={{
										marginLeft: 15,
										fontSize: 14,
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										color: Colors.secondaryFont,
										opacity: 0.8,
										marginHorizontal: 10,
									}}
								>
									{this.props.value}
								</Text>
								<FontAwesomeIcon
									size={18}
									icon={faAngleRight}
									color={Colors.secondaryBtn}
								/>
							</View>
						</>
					</TouchableHighlight>
				)}

				<BottomSheet
					isVisible={this.state.isModalOpen}
					title={LocalizedText.CHOOSE_CURRENCY}
					style={{
						height: Math.floor(Constant.WINDOW_HEIGHT * 0.75),
						paddingHorizontal: 15,
					}}
					onClose={this.closeModal}
				>
					<View style={styles.searchBox}>
						<View style={{ width: "10%" }}>
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								size={20}
								color={Colors.mediumGrey}
							/>
						</View>
						<View style={{ width: "90%" }}>
							<TextInput
								placeholder={LocalizedText.SEARCH_CURRENCY}
								placeholderTextColor={Colors.mediumGrey}
								value={this.state.searchValue}
								onChangeText={this.onSearch}
							/>
						</View>
					</View>
					<FlatList
						keyboardShouldPersistTaps="handled"
						data={this.getCurrency()}
						renderItem={this.renderItem}
						keyExtractor={this.keyExtractor}
						showsVerticalScrollIndicator={false}
						initialNumToRender={this?.props?.currencies?.length}
						ListEmptyComponent={this.getListEmptyComponent.bind(this)}
						contentContainerStyle={
							this.props?.currencies?.length <= 0 ? { flex: 1 } : null
						}
					/>
				</BottomSheet>
			</>
		);
	};
}

const styles = StyleSheet.create({
	label: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.lightFont,
		opacity: 0.6,
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
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.9),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		padding: 15,
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
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		flexDirection: "row",
		alignItems: "center",
	},
	currency: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		lineHeight: 21,
		color: Colors.primaryFont,
	},
	searchBox: {
		height: 45,
		width: "100%",
		borderWidth: 1,
		borderRadius: 6,
		borderColor: Colors.lightBorder,
		marginVertical: 15,
		paddingHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	symbolBox: {
		width: 45,
		marginRight: 15,
		backgroundColor: Colors.secondaryAlpha2,
		height: 35,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	symbol: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 21,
		color: Colors.secondary,
	},
	userMenuList: {
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 6,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	iconStyle: {
		width: 35,
		height: 35,
		borderRadius: 90,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default CurrencyPicker;
