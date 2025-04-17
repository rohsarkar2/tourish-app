import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	FlatList,
	Linking,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMapLocationDot } from "@fortawesome/pro-solid-svg-icons/faMapLocationDot";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	NoResult,
	FlatlistFooter,
	OverlayLoader,
} from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { LowSeasonTravellerProductListScreenProps } from "../../navigation/NavigationTypes";
import { IN_APP_BROWSER_OPTIONS } from "../../utils/Util";
import LocalizedText from "../../resources/LocalizedText";
import ProductService from "../../services/ProductService";
import AppContext, { SearchItem } from "../../context/AppContext";
import CustomAlert from "../../components/CustomAlert";

const ITEM_TYPE = {
	Country: "Country",
	Province: "Province",
	City: "City",
	Location: "Location",
};

type States = {
	products: Array<any>;
	page: number;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
	isShowingOverlay: boolean;
	isAlertVisible: boolean;
	lowSeasonItem: any;
};

export default class LowSeasonTravellerProductList extends React.Component<
	LowSeasonTravellerProductListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: LowSeasonTravellerProductListScreenProps) {
		super(props);
		this.state = {
			products: [],
			page: 1,
			isLoading: true,
			isRefresing: false,
			isLoadMore: false,
			isListEnd: true,
			isAlertVisible: false,
			isShowingOverlay: false,
			lowSeasonItem: null,
		};
	}

	componentDidMount = () => {
		this.loadProducts();
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
		const searchData: null | SearchItem = this.context.getLatestSearchData();
		const reqData: any = {
			page: this.state.page,
			limit: 250,
			searchText:
				searchData?.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
					? searchData.iataCode
					: searchData?.name,
			type: searchData?.type,
		};
		if (searchData?.type !== Constant.SEARCH_ITEM_TYPE_COUNTRY) {
			reqData.country = searchData?.country;
		}

		ProductService.getLowSeasonProducts(reqData)
			.then((response: any) => {
				const data: Array<any> = response.data;
				const { products, isRefresing } = this.state;
				const allProducts: Array<any> =
					isRefresing === true ? [...data] : [...products, ...data];

				this.setState({
					products: allProducts,
					isListEnd: allProducts.length === Number(response.count),
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
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
				});
			});
	};

	openDestinationLink = async (pageLink: string) => {
		const isAvailable: boolean = await InAppBrowser.isAvailable();
		if (isAvailable) {
			await InAppBrowser.open(pageLink, IN_APP_BROWSER_OPTIONS);
		} else {
			Linking.openURL(pageLink);
		}
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

	showAlert = (item: any) => {
		this.setState({ isAlertVisible: true, lowSeasonItem: item });
	};
	hideAlert = () => {
		this.setState({ isAlertVisible: false });
	};

	gotoLowSeasonTraveller = () => {
		const { lowSeasonItem } = this.state;
		this.setState({ isAlertVisible: false, isShowingOverlay: true }, () => {
			this.setState({ isShowingOverlay: false }, () => {
				this.openDestinationLink(lowSeasonItem.pageLink);
			});
		});
	};

	messageParts: Array<any> = [{ text: LocalizedText.THIRD_PARTY_WARNING_MSG }];

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				style={styles.row}
				// onPress={this.gotoLowSeasonTraveller.bind(this, item)}
				onPress={this.showAlert.bind(this, item)}
			>
				<View style={{ flexDirection: "row" }}>
					<FontAwesomeIcon
						icon={faMapLocationDot}
						size={25}
						color={Colors.secondary}
						style={{ marginRight: 10, marginTop: 2 }}
					/>
					<View style={{ flex: 1 }}>
						<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
							{item.name}
						</Text>
						{item.type === ITEM_TYPE.Country ? (
							<Text style={styles.subText}>{item.continent}</Text>
						) : null}

						{item.type === ITEM_TYPE.Province ||
						item.type === ITEM_TYPE.City ? (
							<Text style={styles.subText}>{item.country}</Text>
						) : null}

						{item.type === ITEM_TYPE.Location ? (
							<Text style={styles.subText}>
								{`${item.province}, ${item.country}`}
							</Text>
						) : null}
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	render = () => {
		return (
			<Container>
				<Header title="Low Season Traveller" />
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
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
					<CustomAlert
						isVisible={this.state.isAlertVisible}
						title={LocalizedText.WARNING}
						messageParts={this.messageParts}
						buttonContainerStyle={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: "100%",
						}}
						onCancel={this.hideAlert}
						onConfirm={this.gotoLowSeasonTraveller}
					/>
				</WhiteContainer>

				<OverlayLoader visible={this.state.isShowingOverlay} />
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 8,
		paddingHorizontal: 0,
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
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		lineHeight: 21,
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
});
