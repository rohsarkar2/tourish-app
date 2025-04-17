import React, { useRef, useEffect } from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Keyboard,
	TouchableHighlight,
	FlatList,
	TextInput,
} from "react-native";
import isEqual from "lodash/isEqual";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import { faArrowUpArrowDown } from "@fortawesome/pro-light-svg-icons/faArrowUpArrowDown";
import { faCircle } from "@fortawesome/pro-regular-svg-icons/faCircle";
import { faCircleDot } from "@fortawesome/pro-solid-svg-icons/faCircleDot";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import BottomSheet from "../BottomSheet";
import NoResult from "../NoResult";
import LocalizedText from "../../resources/LocalizedText";

const SORT_VALUES = [
	{ label: "Newest First", value: { created_at: -1 } },
	// { label: "Price - Low to High", value: { "price.value": 1 } },
	// { label: "Price - High to Low", value: { "price.value": -1 } },
];

type Props = {
	currencies: Array<any>;
	selectedSortValue: null | any;
	onSort: (sortValue: any) => void;
	onSelect: (item: any) => void;
	value: undefined | string;
};

type States = {
	isLoading: boolean;
	isSortModalOpen: boolean;
	searchValue: string;
	isCurrencyModalOpen: boolean;
};

export default class CommonProductListAction extends React.Component<
	Props,
	States
> {
	constructor(props: Props) {
		super(props);

		this.state = {
			searchValue: "",
			isLoading: false,
			isCurrencyModalOpen: false,
			isSortModalOpen: false,
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
		this.setState({ searchValue: "", isCurrencyModalOpen: false }, () => {
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

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			style={{ flex: 0.3 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	keyExtractor = (item: any) => item._id;

	openCurrencyModal = () => {
		this.setState({
			searchValue: "",
			isCurrencyModalOpen: true,
		});
	};

	closeCurrencyModal = () => {
		Keyboard.dismiss();
		this.setState({ searchValue: "", isCurrencyModalOpen: false });
	};

	onOpenSortModal = () => {
		this.setState({ isSortModalOpen: true });
	};

	onCloseSortModal = () => {
		this.setState({ isSortModalOpen: false });
	};

	onSelectSortItem = (value: any) => {
		this.setState({ isSortModalOpen: false }, () => {
			const { onSort } = this.props;
			onSort(value);
		});
	};

	render = () => (
		<View style={styles.container}>
			<TouchableOpacity
				style={[styles.box, { borderTopLeftRadius: 30 }]}
				onPress={this.state.isLoading ? undefined : this.onOpenSortModal}
				activeOpacity={this.state.isLoading ? 1 : 0.2}
			>
				<Text style={styles.regularText}>{"Sort"}</Text>
				<FontAwesomeIcon
					icon={faArrowUpArrowDown}
					size={16}
					style={{ marginLeft: 5 }}
				/>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.box,
					{ borderLeftWidth: 1, borderLeftColor: Colors.lightBorder },
				]}
				onPress={this.state.isLoading ? undefined : this.openCurrencyModal}
				activeOpacity={this.state.isLoading ? 1 : 0.2}
			>
				<Text style={styles.regularText}>{this.props.value}</Text>
				<FontAwesomeIcon
					icon={faChevronDown}
					size={16}
					style={{ marginLeft: 5 }}
				/>
			</TouchableOpacity>

			<BottomSheet
				isVisible={this.state.isSortModalOpen}
				title={"Sort By"}
				style={{
					height: Math.floor(Constant.WINDOW_HEIGHT * 0.35),
					padding: 0,
				}}
				onClose={this.onCloseSortModal}
			>
				<View
					style={{
						flex: 1,
						width: "100%",
						padding: 15,
						borderTopWidth: 1,
						borderTopColor: Colors.lightBorder,
					}}
				>
					{SORT_VALUES.map((item: any) => {
						const isChecked: boolean = isEqual(
							item.value,
							this.props.selectedSortValue
						);
						return (
							<TouchableOpacity
								key={item.label}
								activeOpacity={1}
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									paddingVertical: 10,
								}}
								onPress={this.onSelectSortItem.bind(this, item.value)}
							>
								<Text style={styles.regularText}>{item.label}</Text>
								<FontAwesomeIcon
									size={16}
									icon={isChecked ? faCircleDot : faCircle}
									color={isChecked ? Colors.primaryBtn : Colors.primaryFont}
								/>
							</TouchableOpacity>
						);
					})}
				</View>
			</BottomSheet>

			<BottomSheet
				isVisible={this.state.isCurrencyModalOpen}
				title={LocalizedText.CHOOSE_CURRENCY}
				style={{
					height: Math.floor(Constant.WINDOW_HEIGHT * 0.75),
					paddingHorizontal: 15,
				}}
				onClose={this.closeCurrencyModal}
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	box: {
		flex: 1,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		padding: 5,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
	},
	regularText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
	},
	tab: {
		height: 40,
		width: "100%",
		paddingHorizontal: 15,
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	activeTab: {
		paddingLeft: 12,
		borderLeftWidth: 3,
		borderLeftColor: Colors.secondary,
		backgroundColor: Colors.white,
	},
	footer: {
		height: 60,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		backgroundColor: Colors.white,
		borderTopWidth: 1,
		borderTopColor: Colors.lightBorder,
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
