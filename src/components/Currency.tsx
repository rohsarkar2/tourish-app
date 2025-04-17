import React, { Component } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	View,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import NoResult from "./NoResult";
import LocalizedText from "../resources/LocalizedText";
import BottomSheet from "./BottomSheet";

type Props = {
	currencies: any[];
	isVisible: boolean;
	onSelect: (item: any) => void;
	onClose: () => void;
};

type States = {
	searchValue: string;
};

class Currency extends Component<Props, States> {
	constructor(props: Props) {
		super(props);
		this.state = {
			searchValue: "",
		};
	}

	getCurrency = () => {
		let filterData = this.props.currencies.filter((element) => {
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
		const { onSelect } = this.props;
		if (typeof onSelect !== "undefined" && typeof onSelect === "function") {
			onSelect(currency);
		}
	};

	renderItem = ({ item }: any) => (
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

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			style={{ flex: 0.3 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	closeModal = () => {
		const { onClose } = this.props;
		if (typeof onClose !== "undefined" && typeof onClose === "function") {
			this.setState({ searchValue: "" });
			onClose();
		}
	};

	render = () => {
		return (
			<BottomSheet
				isVisible={this.props.isVisible}
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
						this.props?.currencies?.length <= 0
							? { flex: 1, backgroundColor: "red" }
							: null
					}
				/>
			</BottomSheet>
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
		fontSize: 16,
		color: Colors.secondary,
	},
});

export default Currency;
