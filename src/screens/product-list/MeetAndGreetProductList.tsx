import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	FlatList,
	Image,
} from "react-native";
import {
	Container,
	WhiteContainer,
	Header,
	NoResult,
	FlatlistFooter,
	OverlayLoader,
} from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { MeetAndGreetListScreenProps } from "../../navigation/NavigationTypes";
import ProductService from "../../services/ProductService";
import AppContext, { SearchItem } from "../../context/AppContext";
import CommonProductListAction from "../../components/product-list/CommonProductListAction";
import { getAllCurrencies } from "../../services/ApiService";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

type States = {
	products: Array<any>;
	currencies: Array<any>;
	selectedCurrency: string | undefined;
	page: number;
	orderBy: null | any;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
	isReInitialize: boolean;
	isOverlayModalStatus: boolean;
};

export default class MeetAndGreetProductList extends React.Component<
	MeetAndGreetListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: MeetAndGreetListScreenProps) {
		super(props);
		this.state = {
			products: [],
			currencies: [],
			selectedCurrency: undefined,
			page: 1,
			orderBy: null,
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
		const { orderBy } = this.state;
		const { userData, getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();
		const reqData: any = {
			searchText:
				searchData?.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
					? searchData.iataCode
					: searchData?.name,
			type: searchData?.type,
			toCurrency: userData?.currency.code as string,
			page: this.state.page,
			limit: Constant.DEFAULT_LIMIT,
		};

		if (searchData?.type !== Constant.SEARCH_ITEM_TYPE_COUNTRY) {
			reqData.country = searchData?.country;
		}

		if (orderBy !== null) {
			reqData.sort = orderBy;
		}

		ProductService.getMeetAndGreetProducts(reqData)
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
		this.props.navigation.navigate("MeetAndGreet", {
			productId: item._id,
			productName: item.name,
		});
	};

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
				limit: Constant.DEFAULT_LIMIT,
			};

			ProductService.getMeetAndGreetProducts(reqData)
				.then((response: any) => {
					const data: Array<any> = response.data;
					const { products, isRefresing, isReInitialize } = this.state;
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

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				style={styles.row}
				onPress={this.gotoProductDetails.bind(this, item)}
			>
				<View style={{ flexDirection: "row" }}>
					<Image
						source={{ uri: item.url }}
						resizeMode="cover"
						style={{ height: 45, width: 45, borderRadius: 5, marginRight: 10 }}
					/>
					<View style={{ flex: 1 }}>
						<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
							{item.name}
						</Text>
						<Text style={styles.subText}>
							{`${item.airport.name} (${item.airport.iata_code})`}
						</Text>
						<Text style={styles.subText}>
							{`${item.city.name}, ${item.province.name}, ${item.country.name}`}
						</Text>
					</View>
					<View
						style={{
							width: 90,
							alignItems: "flex-end",
							justifyContent: "flex-start",
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

	render = () => {
		const { userData } = this.context;
		return (
			<Container>
				<Header title="Meet & Greet" />
				<WhiteContainer style={styles.container}>
					<CommonProductListAction
						selectedSortValue={this.state.orderBy}
						onSort={this.onSort}
						currencies={this.state.currencies}
						value={this.state.selectedCurrency}
						onSelect={this.onSelectCurrency}
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
	row: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		marginHorizontal: 15,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	title: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 13,
		lineHeight: 19,
		opacity: 0.9,
	},
	subText: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		opacity: 0.8,
	},
	boldText: {
		fontSize: 15,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 22,
	},
});
