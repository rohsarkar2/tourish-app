import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	FlatList,
} from "react-native";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	NoResult,
	FlatlistFooter,
	OverlayLoader,
} from "../../components";
import CarRentalProductListAction from "../../components/product-list/CarRentalProductListAction";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import CarRentalProductTypes from "../../configs/CarRentalProductTypes";
import { CarRentalProductListScreenProps } from "../../navigation/NavigationTypes";
import ProductService from "../../services/ProductService";
import { toUpperCaseWord } from "../../utils/Util";
import AppContext, { SearchItem } from "../../context/AppContext";
import { getAllCurrencies } from "../../services/ApiService";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

type States = {
	products: Array<any>;
	currencies: Array<any>;
	selectedCurrency: string | undefined;
	page: number;
	orderBy: null | any;
	selectedCityIds: Array<string>;
	selectedAirportIds: Array<string>;
	selectedProviderIds: Array<string>;
	selectedSubCategories: Array<string>;
	// isAirportProduct: boolean;
	isReInitialize: boolean;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
	isOverlayModalStatus: boolean;
};

export default class CarRentalProductList extends React.Component<
	CarRentalProductListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: CarRentalProductListScreenProps) {
		super(props);
		this.state = {
			products: [],
			currencies: [],
			selectedCurrency: undefined,
			page: 1,
			orderBy: null,
			selectedCityIds: [],
			selectedAirportIds: [],
			selectedProviderIds: [],
			selectedSubCategories: [],
			// isAirportProduct: false,
			isLoading: true,
			isRefresing: false,
			isLoadMore: false,
			isListEnd: true,
			isReInitialize: false,
			isOverlayModalStatus: false,
		};
	}

	componentDidMount = () => {
		this.loadProducts();
		getAllCurrencies()
			.then((response) => {
				this.setState({ currencies: response.data });
			})
			.catch((error) => {
				this.setState({ currencies: [] });
			});
	};

	onSort = (value: any) => {
		this.setState(
			{
				isLoading: true,
				isRefresing: false,
				isLoadMore: false,
				isListEnd: true,
				page: 1,
				orderBy: value,
				isReInitialize: true,
			},
			() => {
				this.loadProducts();
			}
		);
	};

	onApplyFilter = (item: any) => {
		this.setState(
			{
				page: 1,
				isReInitialize: true,
				selectedCityIds: [...item.cityIds],
				selectedAirportIds: [...item.airportIds],
				selectedProviderIds: [...item.providerIds],
				selectedSubCategories: [...item.subCategory],
			},
			() => {
				this.loadProducts();
			}
		);
	};

	onClearFilter = () => {
		this.setState(
			{
				page: 1,
				isReInitialize: true,
				selectedCityIds: [],
				selectedAirportIds: [],
				selectedProviderIds: [],
				selectedSubCategories: [],
			},
			() => {
				this.loadProducts();
			}
		);
	};

	// onToggleAirportProduct = (value: boolean) => {
	// 	this.setState(
	// 		{
	// 			isLoading: true,
	// 			isRefresing: false,
	// 			isLoadMore: false,
	// 			isListEnd: true,
	// 			page: 1,
	// 			isAirportProduct: value,
	// 			isReInitialize: true,
	// 		},
	// 		() => {
	// 			this.loadProducts();
	// 		}
	// 	);
	// };

	handelRefresh = () => {
		this.setState({ isRefresing: true, page: 1 }, () => {
			this.loadProducts();
		});
	};

	handelLoadMore = () => {
		this.setState({ isLoadMore: true, page: this.state.page + 1 }, () => {
			this.loadProducts();
		});
	};

	loadProducts = () => {
		const {
			// isAirportProduct,
			orderBy,
			selectedCityIds,
			selectedAirportIds,
			selectedProviderIds,
			selectedSubCategories,
		} = this.state;

		const { userData, getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();

		const reqData: any = {
			page: this.state.page,
			limit: 25,
			searchText:
				searchData?.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
					? searchData.iataCode
					: searchData?.name,
			type: searchData?.type,
			toCurrency: userData?.currency.code,
		};

		if (searchData?.type !== Constant.SEARCH_ITEM_TYPE_COUNTRY) {
			reqData.country = searchData?.country;
		}

		// if (isAirportProduct === true) {
		// 	reqData.isAirportProduct = true;
		// }
		if (orderBy !== null) {
			reqData.sort = orderBy;
		}
		if (selectedCityIds.length > 0) {
			reqData.cityIds = selectedCityIds;
		}
		if (selectedAirportIds.length > 0) {
			reqData.airportIds = selectedAirportIds;
		}
		if (selectedProviderIds.length > 0) {
			reqData.providerIds = selectedProviderIds;
		}
		if (selectedSubCategories.length > 0) {
			reqData.subCategory = selectedSubCategories;
		}

		ProductService.getCarRentalProducts(reqData)
			.then((response: any) => {
				const data: Array<any> = response.data;
				const { products, isRefresing, isReInitialize } = this.state;
				const allProducts: Array<any> =
					isRefresing || isReInitialize ? [...data] : [...products, ...data];

				this.setState({
					products: allProducts,
					selectedCurrency: userData?.currency.code,
					isListEnd: allProducts.length === Number(response.count),
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
					isReInitialize: false,
				});
			})
			.catch((error) => {
				this.setState({
					page: 1,
					products: [],
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
					isListEnd: true,
					isReInitialize: false,
				});
			});
	};

	gotoProductDetails = (item: any) => {
		if (item.subCategory === CarRentalProductTypes.AIRPORT_TRANSFER) {
			this.props.navigation.navigate("CarRentalAirportTransfer", {
				productId: item._id,
				productName: item.name,
			});
		}
	};

	renderItem = ({ item }: any) => {
		const subCategoryText = toUpperCaseWord(
			item.subCategory.toLowerCase().replaceAll("_", " ")
		);
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				onPress={this.gotoProductDetails.bind(this, item)}
				style={{
					width: Constant.WINDOW_WIDTH - 30,
					marginHorizontal: 15,
					paddingVertical: 10,
					borderBottomWidth: 1,
					borderBottomColor: Colors.lightBorder,
				}}
			>
				<View
					style={{
						width: "100%",
						flexDirection: "row",
						alignItems: "flex-start",
						justifyContent: "space-between",
					}}
				>
					<View style={{ flex: 1, paddingRight: 5 }}>
						<Text
							style={[styles.boldText, { fontSize: 12 }]}
							numberOfLines={2}
							ellipsizeMode="tail"
						>
							{item.name}
						</Text>
						{item.subCategory !== null ? (
							<Text
								style={[styles.regularText, { fontSize: 11, marginBottom: 3 }]}
							>
								{`${subCategoryText} - ${item.numberOfSeats} seater`}
							</Text>
						) : (
							<Text
								style={[styles.regularText, { fontSize: 11, marginBottom: 3 }]}
							>
								{`${item.numberOfSeats} seater`}
							</Text>
						)}

						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 5,
							}}
						>
							<View style={[styles.dot, { backgroundColor: Colors.success }]} />
							<View style={{ flex: 1 }}>
								<Text
									numberOfLines={1}
									ellipsizeMode="tail"
									style={[styles.regularText, { fontSize: 11 }]}
								>
									{item.source}
								</Text>
							</View>
						</View>
						<View style={styles.devider} />
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<View
								style={[
									styles.dot,
									{
										backgroundColor: Colors.danger,
									},
								]}
							/>
							<View style={{ flex: 1 }}>
								<Text
									numberOfLines={1}
									ellipsizeMode="tail"
									style={[styles.regularText, { fontSize: 11 }]}
								>
									{item.destination}
								</Text>
							</View>
						</View>
					</View>
					<View
						style={{
							width: 90,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<Text style={styles.boldText}>
							{`${item.price.code} ${Number(item.price.value).toFixed(2)}`}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	listEmptyComponent = () => (
		<NoResult
			title={"No Results Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	getListFooterComponent = () => (
		<FlatlistFooter
			isListEnd={this.state.isListEnd}
			isLoadMore={this.state.isLoadMore}
		/>
	);

	onSelectCurrency = (value: any) => {
		const { getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();
		this.setState({ isOverlayModalStatus: true }, () => {
			const reqData: any = {
				searchText:
					searchData?.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
						? searchData?.iataCode
						: searchData?.name,
				type: searchData?.type,
				toCurrency: value.code as string,
				page: this.state.page,
				limit: 25,
			};

			ProductService.getCarRentalProducts(reqData)
				.then((response: any) => {
					const data: Array<any> = response.data;
					const { isRefresing, isReInitialize } = this.state;
					const allProducts: Array<any> =
						isRefresing || isReInitialize ? [...data] : [...data];

					this.setState({
						products: allProducts,
						selectedCurrency: value.code,
						isListEnd: allProducts.length === Number(response.count),
						isLoading: false,
						isRefresing: false,
						isLoadMore: false,
						isReInitialize: false,
						isOverlayModalStatus: false,
					});
				})
				.catch((error) => {
					this.setState({
						page: 1,
						products: [],
						isLoading: false,
						isRefresing: false,
						isLoadMore: false,
						isListEnd: true,
						isReInitialize: false,
						isOverlayModalStatus: false,
					});
				});
		});
	};

	render = () => {
		const { userData } = this.context;
		const searchData: null | SearchItem = this.context.getLatestSearchData();
		return (
			<Container>
				<Header title="Car Rentals" />
				<WhiteContainer style={styles.container}>
					<CarRentalProductListAction
						searchText={searchData?.name as string}
						searchItemType={searchData?.type as string}
						countryName={searchData?.country as string}
						// isAvailableInAirport={this.state.isAirportProduct}
						selectedSortValue={this.state.orderBy}
						onSort={this.onSort}
						onApplyFilter={this.onApplyFilter}
						onClearFilter={this.onClearFilter}
						currencies={this.state.currencies}
						value={this.state.selectedCurrency}
						onSelect={this.onSelectCurrency}
						// onToggleAvailableInAirport={this.onToggleAirportProduct}
					/>
					{this.state.isLoading ? (
						// <Loader />
						<>
							{[1, 2, 3].map((item) => (
								<View
									key={item.toString()}
									style={[
										styles.itemContainer,
										{
											width: Constant.WINDOW_WIDTH - 24,
											marginVertical: 10,
											marginHorizontal: 12,
										},
									]}
								>
									<SkeletonPlaceholder>
										<SkeletonPlaceholder.Item>
											<SkeletonPlaceholder.Item
												width={170}
												height={8}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={90}
												height={8}
												borderRadius={3}
												marginBottom={15}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={8}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={8}
												borderRadius={3}
											/>
										</SkeletonPlaceholder.Item>
									</SkeletonPlaceholder>
								</View>
							))}
						</>
					) : (
						<FlatList
							data={this.state.products}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							refreshing={this.state.isRefresing}
							onRefresh={this.handelRefresh}
							showsVerticalScrollIndicator={false}
							onEndReached={
								this.state.isListEnd ? undefined : this.handelLoadMore
							}
							ListFooterComponent={this.getListFooterComponent.bind(this)}
							ListEmptyComponent={this.listEmptyComponent.bind(this)}
							contentContainerStyle={
								this.state.products.length <= 0 ? { flex: 1 } : null
							}
						/>
					)}
				</WhiteContainer>
				<OverlayLoader visible={this.state.isOverlayModalStatus} />
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 0,
		paddingHorizontal: 0,
	},
	itemContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 10,
		width: "100%",
		alignSelf: "center",
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 21,
	},
	regularText: {
		fontSize: 13,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	lightText: {
		fontSize: 11,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		opacity: 0.9,
	},
	dot: {
		height: 6,
		width: 6,
		borderRadius: 100,
		marginRight: 8,
	},
	devider: {
		height: 7,
		width: 7,
		borderLeftWidth: 1,
		borderStyle: "dotted",
		borderColor: Colors.mediumGrey,
		marginLeft: 3,
	},
});
