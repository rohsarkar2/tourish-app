import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	Image,
	FlatList,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlaneUp } from "@fortawesome/pro-solid-svg-icons/faPlaneUp";
import { Container, WhiteContainer, Header, Loader } from "../components";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import ProductCategory from "../configs/ProductCategory";
import { ExploreScreenProps } from "../navigation/NavigationTypes";
import ProductService from "../services/ProductService";
import AirportService from "../services/AirportService";
import AppContext, { SearchItem } from "../context/AppContext";

type States = {
	productCategories: Array<any>;
	airports: Array<any>;
	isLoading: boolean;
};

export default class Explore extends React.Component<
	ExploreScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private focusListner: any;

	constructor(props: ExploreScreenProps) {
		super(props);
		this.state = {
			productCategories: [],
			airports: [],
			isLoading: true,
		};
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onScreenFocus
		);
	};

	onScreenFocus = () => {
		this.setState(
			{ isLoading: true, productCategories: [], airports: [] },
			() => {
				const airportReqData: any = { isOnBoard: true };
				const searchData: null | SearchItem =
					this.context.getLatestSearchData();
				const categoryReqData: any = {
					srchText: searchData?.name,
					type: searchData?.type,
					country: searchData?.country,
				};

				if (searchData?.type === Constant.SEARCH_ITEM_TYPE_COUNTRY) {
					delete categoryReqData.country;
					airportReqData.country_id = searchData?.sourceId;
				} else if (searchData?.type === Constant.SEARCH_ITEM_TYPE_PROVINCE) {
					airportReqData.province_id = searchData?.sourceId;
				} else if (searchData?.type === Constant.SEARCH_ITEM_TYPE_CITY) {
					airportReqData.city_id = searchData?.sourceId;
				} else if (searchData?.type === Constant.SEARCH_ITEM_TYPE_LOCATION) {
					airportReqData.province_id = searchData?.provinceId;
				}

				Promise.all([
					ProductService.getCategories(categoryReqData),
					AirportService.getAll(airportReqData),
				])
					.then((response: Array<any>) => {
						this.setState({
							productCategories: response[0],
							airports: response[1],
							isLoading: false,
						});
					})
					.catch((error) => {
						this.setState({ isLoading: false });
					});
			}
		);
	};

	componentWillUnmount = () => {
		this.focusListner();
	};

	onAirportSelect = (item: any) => {
		const { searchData } = this.context;
		const data: Array<SearchItem> = [...searchData];
		data.push({
			name: item.name,
			type: Constant.SEARCH_ITEM_TYPE_AIRPORT,
			sourceId: item._id,
			country: item.country.name,
			city: item.city.name,
			iataCode: item.iata_code,
		});
		this.context.setSearchData(data);

		setTimeout(() => {
			this.props.navigation.navigate("AirportInfo", {
				airportId: item._id,
				isOnBoard: item.isOnBoard,
			});
		}, 150);
	};

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				onPress={this.onAirportSelect.bind(this, item)}
			>
				<View style={styles.row}>
					<FontAwesomeIcon
						icon={faPlaneUp}
						size={22}
						color={Colors.secondary}
						style={{ marginRight: 10, marginTop: 3 }}
					/>

					<View style={{ flex: 1 }}>
						<Text style={styles.airportTitle}>
							{item.name}
							<Text style={styles.airportCode}>{` (${item.iata_code})`}</Text>
						</Text>
						<Text style={styles.airportCity}>
							{`${item.city.name}, ${item.country.name}`}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	onPressCategory = (item: any) => {
		if (item.category === ProductCategory.LOW_SEASON_TRAVELLER) {
			this.props.navigation.navigate("LowSeasonTravellerProductList");
		} else if (item.category === ProductCategory.CAR_RENTAL) {
			this.props.navigation.navigate("CarRentalProductList");
		} else if (item.category === ProductCategory.E_SIM) {
			this.props.navigation.navigate("EsimProductList");
		} else if (item.category === ProductCategory.MEET_AND_GREET) {
			this.props.navigation.navigate("MeetAndGreetProductList");
		} else if (item.category === ProductCategory.MOBILITY_ASSIST) {
			this.props.navigation.navigate("MobilityAssistProductList");
		} else if (item.category === ProductCategory.PORTER) {
			this.props.navigation.navigate("PorterProductList");
		} else if (item.category === ProductCategory.LOUNGE) {
			this.props.navigation.navigate("LoungeProductList");
		}
	};

	render = () => {
		const searchData: null | SearchItem = this.context.getLatestSearchData();
		return (
			<Container>
				<Header title={searchData?.name} />
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
					) : (
						<View style={{ flex: 1, width: "100%" }}>
							<View style={styles.categoryContainer}>
								{this.state.productCategories.map((item: any) => (
									<View key={item.category} style={styles.categoryBox}>
										<TouchableHighlight
											underlayColor={Colors.secondaryAlpha2}
											onPress={this.onPressCategory.bind(this, item)}
											style={styles.categoryIcon}
										>
											<Image
												source={{ uri: item.icon }}
												style={{ width: 35, height: 35 }}
												resizeMode="cover"
											/>
										</TouchableHighlight>
										<Text style={styles.categoryText}>{item.name}</Text>
									</View>
								))}
							</View>
							{this.state.airports.length > 0 ? (
								<Text style={[styles.title, { marginLeft: 15 }]}>
									{"Airports"}
								</Text>
							) : null}

							<FlatList
								data={this.state.airports}
								renderItem={this.renderItem}
								keyExtractor={this.keyExtractor}
								initialNumToRender={20}
								maxToRenderPerBatch={20}
								removeClippedSubviews={true}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps={"handled"}
							/>
						</View>
					)}
				</WhiteContainer>
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 5,
		paddingHorizontal: 0,
	},
	categoryContainer: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "flex-start",
		marginBottom: 15,
	},
	categoryBox: {
		width: Math.floor(Constant.WINDOW_WIDTH / 3),
		alignItems: "center",
		paddingHorizontal: 10,
		marginVertical: 5,
	},
	categoryIcon: {
		width: 55,
		height: 55,
		borderRadius: 100,
		borderColor: Colors.secondaryAlpha1,
		backgroundColor: Colors.secondaryAlpha1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 5,
	},
	categoryText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		textAlign: "center",
	},
	title: {
		fontSize: 16,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	row: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		marginHorizontal: 15,
		flexDirection: "row",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	airportTitle: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		fontWeight: "400",
		opacity: 0.9,
	},
	airportCode: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontSize: 14,
		fontWeight: "500",
		opacity: 0.9,
	},
	airportCity: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 12,
		fontWeight: "400",
		marginTop: 3,
		opacity: 0.8,
	},
});
