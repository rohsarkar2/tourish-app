import React from "react";
import {
	StyleSheet,
	Text,
	View,
	Linking,
	Image,
	TouchableOpacity,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons/faArrowLeft";
import MaterialTabs from "react-native-material-tabs";
import Carousel from "pinar";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import ProductCategory from "../configs/ProductCategory";
import { Loader, Container } from "../components";
import PageNotFound from "../components/PageNotFound";
import ForYouTab from "../components/AirportInfoTabs/ForYouTab";
import AboutTab from "../components/AirportInfoTabs/AboutTab";
import ArrivalsTab from "../components/AirportInfoTabs/ArrivalsTab";
import DepartureTab from "../components/AirportInfoTabs/DepartureTab";
import WeatherTab from "../components/AirportInfoTabs/WeatherTab";
import AirportMapTab from "../components/AirportInfoTabs/AirportMapTab";
import LocalTime from "../components/AirportInfoTabs/LocalTime";
import LocalizedText from "../resources/LocalizedText";
import { getAirportData } from "../services/ApiService";
import ProductService from "../services/ProductService";
import { AirportInfoScreenProps } from "../navigation/NavigationTypes";
import AppContext, { SearchItem } from "../context/AppContext";
import ProgressiveImage from "../components/ProgressiveImage";

type States = {
	airportId: string;
	isOnBoard: boolean;
	airportData: null | any;
	productCategories: Array<any>;
	tabItems: Array<string>;
	selectedTabIndex: number;
	isLoading: boolean;
};

export default class AirportInfo extends React.Component<
	AirportInfoScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private focusListner: any;
	private beforeRemoveListner: any;

	constructor(props: any) {
		super(props);

		this.state = {
			airportId: this.props.route.params.airportId,
			isOnBoard: this.props.route.params.isOnBoard,
			airportData: null,
			productCategories: [],
			tabItems: [
				LocalizedText.ABOUT,
				// LocalizedText.ARRIVAL,
				// LocalizedText.DEPARTURE,
				LocalizedText.WEATHER,
				LocalizedText.AIRPORT_MAP,
			],
			selectedTabIndex: 0,
			isLoading: true,
		};
	}

	componentDidMount = (): void => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onScreenFocus
		);
		this.beforeRemoveListner = this.props.navigation.addListener(
			"beforeRemove",
			this.onRemoveScreen
		);
	};

	componentWillUnmount = () => {
		this.focusListner();
		this.beforeRemoveListner();
	};

	onRemoveScreen = () => {
		const { searchData } = this.context;
		const data: Array<SearchItem> = [...searchData];
		if (data.length > 1) {
			data.pop();
			this.context.setSearchData(data);
		}
		return true;
	};

	onScreenFocus = () => {
		this.setState(
			{
				isLoading: true,
				airportData: null,
				productCategories: [],
				selectedTabIndex: 0,
			},
			() => {
				const { airportId, isOnBoard } = this.state;
				if (isOnBoard === true) {
					const searchData: null | SearchItem =
						this.context.getLatestSearchData();
					const categoryReqData: any = {
						srchText: searchData?.iataCode,
						type: searchData?.type,
						country: searchData?.country,
					};

					Promise.all([
						getAirportData(airportId as string),
						ProductService.getCategories(categoryReqData),
					])
						.then((response: Array<any>) => {
							const airportResponse: any = response[0];
							const productCategoryResponse: Array<any> = response[1];
							const items: Array<string> = [...this.state.tabItems];
							if (
								productCategoryResponse.length > 0 &&
								!items.includes(LocalizedText.FOR_YOU)
							) {
								items.unshift(LocalizedText.FOR_YOU);
							}

							this.setState({
								airportData:
									airportResponse.check === true ? airportResponse.data : null,
								productCategories: productCategoryResponse,
								tabItems: items,
								isLoading: false,
							});
						})
						.catch((error) => {
							this.setState({
								airportData: null,
								isLoading: false,
							});
						});
				} else {
					this.setState({ isLoading: false });
				}
			}
		);
	};

	onChangeTab = (index: number) => {
		this.setState({ selectedTabIndex: index });
	};

	goToMap = () => {
		Linking.openURL(this.state.airportData.map_url);
	};

	gotoProductList = (item: any) => {
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

	renderTabContent = () => {
		const { productCategories, selectedTabIndex } = this.state;
		const tabIndex: number =
			productCategories.length <= 0 ? selectedTabIndex + 1 : selectedTabIndex;

		switch (tabIndex) {
			case 0:
				return (
					<ForYouTab
						productCategories={this.state.productCategories}
						onPressProductCategory={this.gotoProductList}
					/>
				);
			case 1:
				return <AboutTab data={this.state.airportData.about} />;
			// case 2:
			// 	return (
			// 		<ArrivalsTab
			// 			airportId={this.state.airportId as string}
			// 			iataCode={this.state.airportData.iata_code}
			// 			timeZone={this.state.airportData.timezone}
			// 		/>
			// 	);
			// case 3:
			// 	return (
			// 		<DepartureTab
			// 			airportId={this.state.airportId as string}
			// 			iataCode={this.state.airportData.iata_code}
			// 			timeZone={this.state.airportData.timezone}
			// 		/>
			// 	);
			case 2:
				return (
					<WeatherTab
						airport_id={this.state.airportData._id}
						latitude={this.state.airportData.lat_deg}
						longitude={this.state.airportData.long_deg}
						timeZone={this.state.airportData.timezone}
					/>
				);
			case 3:
				return (
					<AirportMapTab
						map={
							this.state.airportData.hasOwnProperty("maps")
								? this.state.airportData.maps
								: []
						}
						lat={this.state.airportData.lat_deg}
						lng={this.state.airportData.long_deg}
						name={this.state.airportData.name}
					/>
				);
			default:
				return null;
		}
	};

	gotoBack = () => {
		this.props.navigation.pop(1);
	};

	render = (): React.ReactNode => (
		<Container
			style={styles.container}
			statusBarColor={
				this.state.isOnBoard
					? this.state.isLoading
						? Colors.white
						: this.state.airportData !== null
						? this.state.airportData.header_background_color
						: Colors.white
					: Colors.white
			}
		>
			{this.state.isOnBoard ? (
				this.state.isLoading ? (
					<Loader />
				) : (
					<View style={{ flex: 1, width: "100%" }}>
						<View
							style={{
								width: "100%",
								backgroundColor: this.state.airportData.header_background_color,
							}}
						>
							<TouchableOpacity onPress={this.gotoBack} style={styles.backBtn}>
								<FontAwesomeIcon
									size={25}
									icon={faArrowLeft}
									color={
										this.state.airportData.primary_color ===
										this.state.airportData.header_background_color
											? this.state.airportData.header_text_color
											: this.state.airportData.primary_color
									}
								/>
							</TouchableOpacity>

							<View style={styles.header}>
								<View
									style={{
										width: "100%",
										flexDirection: "row",
									}}
								>
									<View style={{ width: "70%" }}>
										<Text
											style={[
												styles.code,
												{ color: this.state.airportData.header_text_color },
											]}
										>
											{`${this.state.airportData.iata_code} / ${this.state.airportData.icao_code}`}
										</Text>
										<Text
											style={[
												styles.airportName,
												{ color: this.state.airportData.header_text_color },
											]}
										>
											{this.state.airportData.name}
										</Text>
										<Text
											style={[
												styles.country,
												{ color: this.state.airportData.header_text_color },
											]}
										>
											{`${this.state.airportData.city.name}, ${this.state.airportData.country.name}`}
										</Text>
									</View>
									<View style={{ width: "30%", alignItems: "flex-end" }}>
										<LocalTime
											timeZone={this.state.airportData.timezone}
											color={this.state.airportData.header_text_color}
										/>
										<View style={{ height: 5 }} />
										<Image
											resizeMode="contain"
											source={{ uri: this.state.airportData.logo }}
											style={styles.logo}
										/>
									</View>
								</View>
							</View>
						</View>

						{this.state.airportData.hasOwnProperty("banners") &&
						this.state.airportData.banners.length > 0 ? (
							<View style={{ height: 200, width: "100%" }}>
								<Carousel
									loop={true}
									showsDots={true}
									showsControls={false}
									width={Constant.WINDOW_WIDTH}
									height={200}
									dotStyle={styles.carouselDotStyle}
									activeDotStyle={[
										styles.carouselActiveDotStyle,
										{
											backgroundColor:
												this.state.airportData.primary_color ||
												Colors.secondary,
										},
									]}
								>
									{this.state.airportData.banners.map(
										(item: any, index: number) => (
											// <Image
											// 	key={`banner-${index.toString()}`}
											// 	source={{
											// 		uri: item,
											// 	}}
											// 	style={styles.banner}
											// 	resizeMode="cover"
											// />
											<ProgressiveImage
												key={`banner-${index.toString()}`}
												source={{ uri: item }}
											/>
										)
									)}
								</Carousel>
							</View>
						) : null}

						<View style={styles.tabView}>
							<MaterialTabs
								items={this.state.tabItems}
								selectedIndex={this.state.selectedTabIndex}
								onChange={this.onChangeTab}
								barColor={Colors.white}
								indicatorColor={
									this.state.airportData.primary_color || Colors.secondary
								}
								activeTextColor={
									this.state.airportData.primary_color || Colors.secondary
								}
								inactiveTextColor={Colors.lightFont}
								scrollable={true}
								allowFontScaling={true}
								uppercase={false}
							/>
						</View>
						{this.renderTabContent()}
					</View>
				)
			) : (
				<PageNotFound onClose={this.gotoBack} />
			)}
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		backgroundColor: Colors.white,
	},
	backBtn: {
		height: 35,
		width: 35,
		padding: 5,
		borderRadius: 100,
		marginLeft: 5,
	},
	header: {
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	code: {
		color: Colors.white,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
	},
	airportName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.white,
		fontSize: 15,
	},
	country: {
		color: Colors.white,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		marginTop: 3,
	},
	logo: {
		height: 40,
		width: 70,
	},
	carouselDotStyle: {
		backgroundColor: Colors.white,
		height: 3,
		width: 20,
		borderRadius: 10,
		margin: 3,
	},
	carouselActiveDotStyle: {
		backgroundColor: Colors.white,
		height: 3,
		width: 20,
		borderRadius: 10,
		margin: 3,
	},
	banner: {
		height: 200,
	},
	tabView: {
		borderBottomColor: Colors.lightBorder,
		borderBottomWidth: 1,
	},
});
