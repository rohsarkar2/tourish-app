import React, { useRef, useEffect } from "react";
import {
	Animated,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ScrollView,
	Keyboard,
	TouchableHighlight,
	FlatList,
	TextInput,
} from "react-native";
import isEqual from "lodash/isEqual";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import { faArrowUpArrowDown } from "@fortawesome/pro-light-svg-icons/faArrowUpArrowDown";
import { faFilter } from "@fortawesome/pro-light-svg-icons/faFilter";
import { faCircle } from "@fortawesome/pro-regular-svg-icons/faCircle";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faCircleDot } from "@fortawesome/pro-solid-svg-icons/faCircleDot";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import BottomSheet from "../BottomSheet";
import CheckBox from "../CheckBox";
import Button from "../Button";
import { toUpperCaseWord } from "../../utils/Util";
import ProductService from "../../services/ProductService";
import NoResult from "../NoResult";
import LocalizedText from "../../resources/LocalizedText";

// type SwitchProps = {
// 	isEnabled: any;
// 	onValueChange: (value: boolean) => void;
// };

// const Switch: React.FC<SwitchProps> = (props) => {
// 	const switchTranslate = useRef(new Animated.Value(0)).current;

// 	useEffect(() => {
// 		if (!props.isEnabled) {
// 			Animated.timing(switchTranslate, {
// 				toValue: 2,
// 				duration: 250,
// 				useNativeDriver: true,
// 			}).start();
// 		} else {
// 			Animated.timing(switchTranslate, {
// 				toValue: 15,
// 				duration: 250,
// 				useNativeDriver: true,
// 			}).start();
// 		}
// 	}, [props.isEnabled]);

// 	const onChange = () => {
// 		const { onValueChange, isEnabled } = props;
// 		onValueChange(!isEnabled);
// 	};

// 	return (
// 		<TouchableOpacity activeOpacity={1} onPress={onChange}>
// 			<View
// 				style={[
// 					styles.switchContainer,
// 					props.isEnabled ? styles.activeSwitch : styles.inActiveSwitch,
// 				]}
// 			>
// 				<Animated.View
// 					style={[
// 						styles.switchCircle,
// 						{ transform: [{ translateX: switchTranslate }] },
// 					]}
// 				/>
// 			</View>
// 		</TouchableOpacity>
// 	);
// };

type CityTabProps = {
	cities: Array<any>;
	onSelectCity: (value: any) => void;
};

type AirportTabProps = {
	airports: Array<any>;
	onSelectAirport: (value: any) => void;
};

type ProviderTabProps = {
	providers: Array<any>;
	onSelectProvider: (value: any) => void;
};

type CategoryTabProps = {
	categories: Array<any>;
	onSelectCategory: (value: any) => void;
};

class CityTab extends React.Component<CityTabProps, any> {
	onSelectItem = (item: any) => {
		this.props.onSelectCity(item);
	};

	render = (): React.ReactNode => (
		<View style={{ flex: 1, width: "100%", padding: 15 }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{this.props.cities.map((item: any, index: number) => (
					<CheckBox
						key={`city-${index}`}
						size={14}
						isChecked={item.isChecked}
						title={item.name}
						onPress={this.onSelectItem.bind(this, item)}
						style={{ marginBottom: 5 }}
					/>
				))}
			</ScrollView>
		</View>
	);
}

class AirportTab extends React.Component<AirportTabProps, any> {
	onSelectItem = (item: any) => {
		this.props.onSelectAirport(item);
	};

	render = (): React.ReactNode => (
		<View style={{ flex: 1, width: "100%", padding: 15 }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{this.props.airports.map((item: any, index: number) => (
					<CheckBox
						key={`airport-${index}`}
						size={14}
						isChecked={item.isChecked}
						title={`${item.name} (${item.iata_code})`}
						onPress={this.onSelectItem.bind(this, item)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

class ProviderTab extends React.Component<ProviderTabProps, any> {
	onSelectItem = (item: any) => {
		this.props.onSelectProvider(item);
	};

	render = (): React.ReactNode => (
		<View style={{ flex: 1, width: "100%", padding: 15 }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{this.props.providers.map((item: any, index: number) => (
					<CheckBox
						key={`provider-${index}`}
						size={14}
						isChecked={item.isChecked}
						title={item.name}
						onPress={this.onSelectItem.bind(this, item)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

class CategoryTab extends React.Component<CategoryTabProps, any> {
	onSelectItem = (item: any) => {
		this.props.onSelectCategory(item);
	};

	render = (): React.ReactNode => (
		<View style={{ flex: 1, width: "100%", padding: 15 }}>
			<ScrollView showsVerticalScrollIndicator={false}>
				{this.props.categories.map((item: any, index: number) => (
					<CheckBox
						key={`category-${index}`}
						size={14}
						isChecked={item.isChecked}
						title={item.name}
						onPress={this.onSelectItem.bind(this, item)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

const SORT_VALUES = [
	{ label: "Newest First", value: { createdOn: -1 } },
	{ label: "Price - Low to High", value: { "price.value": 1 } },
	{ label: "Price - High to Low", value: { "price.value": -1 } },
];

type Props = {
	currencies: Array<any>;
	value: undefined | string;
	searchText: string;
	searchItemType: string;
	countryName: undefined | string;
	// isAvailableInAirport: boolean;
	selectedSortValue: null | any;
	onSort: (sortValue: any) => void;
	onApplyFilter: (filterValue: any) => void;
	onClearFilter: () => void;
	onSelect: (item: any) => void;
	// onToggleAvailableInAirport: (value: boolean) => void;
};

type States = {
	availableCities: Array<any>;
	availableAirports: Array<any>;
	airports: Array<any>;
	providers: Array<any>;
	categories: Array<any>;
	selectedTabIndex: number;
	isLoading: boolean;
	isSortModalOpen: boolean;
	isFilterModalOpen: boolean;
	searchValue: string;
	isCurrencyModalOpen: boolean;
};

export default class CarRentalProductListAction extends React.Component<
	Props,
	States
> {
	constructor(props: Props) {
		super(props);

		this.state = {
			availableCities: [],
			availableAirports: [],
			airports: [],
			providers: [],
			categories: [],
			selectedTabIndex: 0,
			isLoading: false,
			isSortModalOpen: false,
			isFilterModalOpen: false,
			searchValue: "",
			isCurrencyModalOpen: false,
		};
	}

	componentDidMount = (): void => {
		const { searchText, searchItemType, countryName } = this.props;
		const queryParams: any = {
			searchText: searchText,
			type: searchItemType,
		};
		if (searchItemType !== Constant.SEARCH_ITEM_TYPE_COUNTRY) {
			queryParams.country = countryName;
		}

		ProductService.getCarRentalProductFilters(queryParams)
			.then((response: any) => {
				const resCities: Array<any> = response.Cities;
				const resAirports: Array<any> = response.Airports;
				const resProviders: Array<any> = response.Provider;
				const resCategories: Array<any> = response.Categories;

				const cityArr: Array<any> = resCities.map((item: any) => ({
					...item,
					isChecked: false,
				}));
				const airportArr: Array<any> = resAirports.map((item: any) => ({
					...item,
					isChecked: false,
				}));
				const providerArr: Array<any> = resProviders.map((item: any) => ({
					...item,
					isChecked: false,
				}));
				const categoryArr: Array<any> = resCategories.map((item: string) => ({
					_id: item,
					name: toUpperCaseWord(item.replaceAll("_", " ")),
					isChecked: false,
				}));

				this.setState({
					availableCities: [...cityArr],
					availableAirports: [...airportArr],
					airports: [...airportArr],
					providers: [...providerArr],
					categories: [...categoryArr],
					isLoading: false,
				});
			})
			.catch((error) => {
				this.setState({ isLoading: false });
			});
	};

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

	// onToggleSwitch = (value: boolean) => {
	// 	const { onToggleAvailableInAirport } = this.props;
	// 	onToggleAvailableInAirport(value);
	// };

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

	onOpenFilterModal = () => {
		this.setState({ selectedTabIndex: 0, isFilterModalOpen: true });
	};

	onCloseFilterModal = () => {
		this.setState({ isFilterModalOpen: false });
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

	onChangeTab = (index: number) => {
		this.setState({ selectedTabIndex: index });
	};

	onSelectCity = (item: any) => {
		const { availableCities, availableAirports } = this.state;
		const modCities: Array<any> = [...availableCities];
		const cityId: string = item._id;
		const index: number = modCities.findIndex(
			(element: any) => element._id === cityId
		);
		if (index > -1) {
			const data: any = modCities[index];
			data.isChecked = !data.isChecked;
			modCities[index] = data;

			const unCheckedAirports: Array<any> = availableAirports.map(
				(item: any) => {
					return { ...item, isChecked: false };
				}
			);

			const selectedCityIds: Array<string> = [];
			modCities.forEach((item: any) => {
				if (item.isChecked) {
					selectedCityIds.push(item._id);
				}
			});

			if (selectedCityIds.length > 0) {
				const filteredAirports: Array<any> = unCheckedAirports.filter(
					(item: any) => selectedCityIds.includes(item.city_id)
				);

				this.setState({
					availableCities: modCities,
					airports: filteredAirports,
				});
			} else {
				this.setState({
					availableCities: modCities,
					airports: availableAirports,
				});
			}
		}
	};

	onSelectAirport = (item: any) => {
		const { airports } = this.state;
		const modAirports: Array<any> = [...airports];
		const airportId: string = item._id;
		const index: number = modAirports.findIndex(
			(element: any) => element._id === airportId
		);

		if (index > -1) {
			const data: any = modAirports[index];
			data.isChecked = !data.isChecked;
			modAirports[index] = data;
			this.setState({ airports: modAirports });
		}
	};

	onSelectProvider = (item: any) => {
		const { providers } = this.state;
		const modProviders: Array<any> = [...providers];
		const providerId: string = item._id;
		const index: number = modProviders.findIndex(
			(element: any) => element._id === providerId
		);

		if (index > -1) {
			const data: any = modProviders[index];
			data.isChecked = !data.isChecked;
			modProviders[index] = data;
			this.setState({ providers: modProviders });
		}
	};

	onSelectCategory = (item: any) => {
		const { categories } = this.state;
		const modCategories: Array<any> = [...categories];
		const categoryId: string = item._id;
		const index: number = modCategories.findIndex(
			(element: any) => element._id === categoryId
		);

		if (index > -1) {
			const data: any = modCategories[index];
			data.isChecked = !data.isChecked;
			modCategories[index] = data;
			this.setState({ categories: modCategories });
		}
	};

	applyFilter = () => {
		const { availableCities, airports, providers, categories } = this.state;
		const selectedCityIds: Array<string> = [];
		const selectedAirportIds: Array<string> = [];
		const selectedProviderIds: Array<string> = [];
		const selectedSubCategories: Array<string> = [];

		availableCities.forEach((item: any) => {
			if (item.isChecked) {
				selectedCityIds.push(item._id);
			}
		});
		airports.forEach((item: any) => {
			if (item.isChecked) {
				selectedAirportIds.push(item._id);
			}
		});
		providers.forEach((item: any) => {
			if (item.isChecked) {
				selectedProviderIds.push(item._id);
			}
		});
		categories.forEach((item: any) => {
			if (item.isChecked) {
				selectedSubCategories.push(item._id);
			}
		});

		this.setState({ isFilterModalOpen: false }, () => {
			this.props.onApplyFilter({
				cityIds: selectedCityIds,
				airportIds: selectedAirportIds,
				providerIds: selectedProviderIds,
				subCategory: selectedSubCategories,
			});
		});
	};

	clearFilter = () => {
		const { availableCities, availableAirports, providers, categories } =
			this.state;
		const cityArr: Array<any> = availableCities.map((item: any) => ({
			...item,
			isChecked: false,
		}));
		const airportArr: Array<any> = availableAirports.map((item: any) => ({
			...item,
			isChecked: false,
		}));
		const providerArr: Array<any> = providers.map((item: any) => ({
			...item,
			isChecked: false,
		}));
		const categoryArr: Array<any> = categories.map((item: any) => ({
			...item,
			isChecked: false,
		}));

		this.setState(
			{
				availableCities: [...cityArr],
				availableAirports: [...airportArr],
				airports: [...airportArr],
				providers: [...providerArr],
				categories: [...categoryArr],
				isFilterModalOpen: false,
			},
			() => {
				this.props.onClearFilter();
			}
		);
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
			<TouchableOpacity
				style={[
					styles.box,
					{ borderLeftWidth: 1, borderLeftColor: Colors.lightBorder },
				]}
				onPress={this.state.isLoading ? undefined : this.onOpenFilterModal}
				activeOpacity={this.state.isLoading ? 1 : 0.2}
			>
				<Text style={styles.regularText}>{"Filter"}</Text>
				<FontAwesomeIcon icon={faFilter} size={16} style={{ marginLeft: 5 }} />
			</TouchableOpacity>
			{/* <View
				style={[
					styles.box,
					{
						borderTopRightRadius: 30,
						justifyContent: "space-around",
					},
				]}
			>
				<View style={{ width: "50%" }}>
					<Text style={styles.regularText}>{"Available in Airport"}</Text>
				</View>
				<Switch
					isEnabled={this.props.isAvailableInAirport}
					onValueChange={this.onToggleSwitch}
				/>
			</View> */}
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
				isVisible={this.state.isFilterModalOpen}
				title={"Filter"}
				style={{
					height: Math.floor(Constant.WINDOW_HEIGHT * 0.65),
					padding: 0,
				}}
				onClose={this.onCloseFilterModal}
			>
				<View
					style={{
						flex: 1,
						width: "100%",
						flexDirection: "row",
						borderTopWidth: 1,
						borderTopColor: Colors.lightBorder,
					}}
				>
					<View
						style={{
							width: "35%",
							height: "100%",
							backgroundColor: "#f2f2f2",
						}}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							{["Cities", "Airports", "Providers", "Categories"].map(
								(item: string, index: number) => (
									<TouchableOpacity
										key={`tab-${item}`}
										onPress={this.onChangeTab.bind(this, index)}
										style={[
											styles.tab,
											this.state.selectedTabIndex === index
												? styles.activeTab
												: null,
										]}
									>
										<Text
											style={[
												styles.regularText,
												this.state.selectedTabIndex === index
													? { color: Colors.secondary }
													: null,
											]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item}
										</Text>
									</TouchableOpacity>
								)
							)}
						</ScrollView>
					</View>
					<View
						style={{
							width: "65%",
							height: "100%",
							backgroundColor: Colors.white,
						}}
					>
						{this.state.selectedTabIndex === 0 ? (
							<CityTab
								cities={this.state.availableCities}
								onSelectCity={this.onSelectCity}
							/>
						) : this.state.selectedTabIndex === 1 ? (
							<AirportTab
								airports={this.state.airports}
								onSelectAirport={this.onSelectAirport}
							/>
						) : this.state.selectedTabIndex === 2 ? (
							<ProviderTab
								providers={this.state.providers}
								onSelectProvider={this.onSelectProvider}
							/>
						) : this.state.selectedTabIndex === 3 ? (
							<CategoryTab
								categories={this.state.categories}
								onSelectCategory={this.onSelectCategory}
							/>
						) : null}
					</View>
				</View>
				<View style={styles.footer}>
					<Button
						title={"Clear"}
						titleStyle={{ color: Colors.primaryBtn }}
						style={{ height: 35, width: 110, backgroundColor: Colors.white }}
						onPress={this.clearFilter}
					/>
					<Button
						title={"Apply"}
						style={{ height: 35, width: 110 }}
						onPress={this.applyFilter}
					/>
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
	// switchContainer: {
	// 	borderWidth: 1,
	// 	borderRadius: 100,
	// 	width: 35,
	// 	height: 20,
	// 	justifyContent: "center",
	// },
	// inActiveSwitch: {
	// 	borderColor: Colors.mediumGrey,
	// 	backgroundColor: Colors.mediumGrey,
	// },
	// activeSwitch: {
	// 	borderColor: Colors.primaryBtn,
	// 	backgroundColor: Colors.primaryBtn,
	// },
	// switchCircle: {
	// 	height: 15,
	// 	width: 15,
	// 	borderRadius: 100,
	// 	backgroundColor: Colors.white,
	// },
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
