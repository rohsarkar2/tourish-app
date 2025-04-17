import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
	TouchableHighlight,
	Keyboard,
	Alert,
} from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import debounce from "lodash.debounce";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlaneUp } from "@fortawesome/pro-light-svg-icons/faPlaneUp";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons/faLocationDot";
import { faMap } from "@fortawesome/pro-solid-svg-icons/faMap";
import { faFile } from "@fortawesome/pro-solid-svg-icons/faFile";
import { FlatList } from "react-native-gesture-handler";
import {
	Container,
	Header,
	Button,
	Card,
	BottomSheet,
	AutoCompleteInput,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import CarRentalProductTypes from "../configs/CarRentalProductTypes";
import { HomeScreenProps } from "../navigation/NavigationTypes";
import GlobalSearchService from "../services/GlobalSearchService";
import AppContext, { SearchItem } from "../context/AppContext";
import CustomAlert from "../components/CustomAlert";

const validationSchema = Yup.object().shape({
	name: Yup.string().required("Type an airport or a destination name"),
});

type FormModel = {
	name: string;
};

type States = {
	searchResult: Array<any>;
	searchItem: undefined | any;
	isSearching: boolean;
	isSearchResultHide: boolean;
	isSignInModalOpen: boolean;
	notOnBoardedItem: boolean;
	isAlertVisible: boolean;
};

export default class Home extends React.Component<HomeScreenProps, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;
	private focusListner: any;

	constructor(props: any) {
		super(props);
		this.state = {
			searchResult: [],
			searchItem: undefined,
			isSearching: false,
			isSearchResultHide: true,
			isSignInModalOpen: false,
			notOnBoardedItem: false,
			isAlertVisible: false,
		};

		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);

		const { userData } = this.context;
		this.setState({ isSignInModalOpen: userData === null });
	};

	componentWillUnmount = () => {
		this.focusListner();
	};

	onFocusScreen = () => {
		const { getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();
		this.setState(
			{
				searchResult: [],
				searchItem: searchData !== null ? searchData : undefined,
				isSearchResultHide: true,
				notOnBoardedItem: false,
				isAlertVisible: false,
			},
			() => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue(
						"name",
						searchData !== null ? searchData.name : ""
					);
			}
		);
	};

	showAlert = () => {
		this.setState({ isAlertVisible: true });
	};
	hideAlert = () => {
		this.setState({ isAlertVisible: false });
	};

	onCloseSignInModal = () => {
		this.setState({ isSignInModalOpen: false });
	};

	gotoSignIn = () => {
		this.setState({ isSignInModalOpen: false }, () => {
			this.props.navigation.navigate("SignIn");
		});
	};

	onSearch = (value: string) => {
		this.setState({ isSearching: true }, () => {
			GlobalSearchService.search(value)
				.then((response: Array<any>) => {
					this.setState({
						searchResult: response,
						isSearchResultHide: false,
						isSearching: false,
					});
				})
				.catch((error) => {
					this.setState({ isSearching: false, isSearchResultHide: true });
				});
		});
	};

	onChangeSearchText = (value: string) => {
		let trimValue: string = value.trim();
		this.formikRef && this.formikRef.current?.setFieldValue("name", value);

		if (trimValue.length > 2) {
			let debounceFunction = debounce(
				() => {
					this.onSearch(value);
				},
				300,
				{ maxWait: 1 }
			);
			debounceFunction();
		} else {
			this.setState({
				isSearching: false,
				isSearchResultHide: true,
				searchResult: [],
			});
		}
	};

	onClearSearchText = () => {
		this.setState({ searchItem: undefined, isSearchResultHide: true }, () => {
			this.formikRef && this.formikRef.current?.resetForm();
			this.context.setSearchData([]);
		});
	};

	onSelectSearchItem = (item: any) => {
		Keyboard.dismiss();
		this.setState(
			{
				searchItem: item,
				isSearchResultHide: true,
				notOnBoardedItem: false,
			},
			() => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue("name", item.name);
			}
		);
	};

	gotoLowSeasonList = () => {
		this.setState({ isAlertVisible: false }, () => {
			this.props.navigation.navigate("LowSeasonDestinationList");
		});
	};

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			key={item._id}
			activeOpacity={0.5}
			underlayColor={Colors.rippleColor}
			onPress={this.onSelectSearchItem.bind(this, item)}
		>
			<View style={styles.searchItemContainer}>
				<FontAwesomeIcon
					icon={
						item.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
							? faPlaneUp
							: faLocationDot
					}
					size={18}
					color={Colors.mediumGrey}
					style={{ marginRight: 10, marginTop: 3 }}
				/>

				<View style={{ flex: 1, justifyContent: "flex-start" }}>
					<Text style={styles.name}>
						{item.name}
						{item.type === Constant.SEARCH_ITEM_TYPE_AIRPORT ? (
							<Text style={styles.iataCode}>{` (${item.iataCode})`}</Text>
						) : null}
					</Text>
					{item.type === Constant.SEARCH_ITEM_TYPE_COUNTRY ? (
						<Text style={styles.cityCountry}>{item.continent}</Text>
					) : null}

					{item.type === Constant.SEARCH_ITEM_TYPE_PROVINCE ? (
						<Text style={styles.cityCountry}>{item.country}</Text>
					) : null}

					{item.type === Constant.SEARCH_ITEM_TYPE_CITY ||
					item.type === Constant.SEARCH_ITEM_TYPE_LOCATION ? (
						<Text style={styles.cityCountry}>
							{`${item.province}, ${item.country}`}
						</Text>
					) : null}

					{item.type === Constant.SEARCH_ITEM_TYPE_AIRPORT ? (
						<Text style={styles.cityCountry}>
							{`${item.city}, ${item.country}`}
						</Text>
					) : null}
				</View>
			</View>
		</TouchableHighlight>
	);

	keyExtractor = (item: any) => item._id;

	renderResultList = (listProps: any) => (
		<View
			style={{
				height: "auto",
				maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.35),
				backgroundColor: Colors.white,
			}}
		>
			<FlatList
				data={listProps.data}
				renderItem={this.renderItem}
				keyExtractor={this.keyExtractor}
				initialNumToRender={25}
				maxToRenderPerBatch={25}
				removeClippedSubviews={true}
				showsVerticalScrollIndicator={true}
				keyboardShouldPersistTaps="handled"
				persistentScrollbar={true}
			/>
		</View>
	);

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: FormModel) => {
		const { searchItem } = this.state;
		if (typeof searchItem === "undefined") {
			this.setState({ notOnBoardedItem: true });
		} else {
			this.setState({ notOnBoardedItem: false }, () => {
				const item: SearchItem = {
					name: searchItem.name,
					type: searchItem.type,
					sourceId: searchItem.sourceId,
				};

				switch (searchItem.type) {
					case Constant.SEARCH_ITEM_TYPE_COUNTRY:
					case Constant.SEARCH_ITEM_TYPE_PROVINCE:
						item.country = searchItem.country;
						break;
					case Constant.SEARCH_ITEM_TYPE_CITY:
					case Constant.SEARCH_ITEM_TYPE_LOCATION:
						item.country = searchItem.country;
						item.province = searchItem.province;
						item.provinceId = searchItem.provinceId;
						break;
					case Constant.SEARCH_ITEM_TYPE_AIRPORT:
						item.country = searchItem.country;
						item.city = searchItem.city;
						item.iataCode = searchItem.iataCode;
						break;
					default:
						break;
				}

				const { searchData } = this.context;
				const data: Array<SearchItem> = [...searchData];
				data.push(item);
				this.context.setSearchData(data);

				setTimeout(() => {
					if (searchItem.type === Constant.SEARCH_ITEM_TYPE_AIRPORT) {
						this.props.navigation.navigate("AirportInfo", {
							airportId: searchItem.sourceId,
							isOnBoard: true,
						});
					} else {
						this.props.navigation.navigate("Explore");
					}
				}, 200);
			});
		}
	};

	messageParts: Array<any> = [
		{ text: "The information provided here is curated by " },
		{
			link: "https://lowseasontraveller.com",
			linkText: "lowseasontraveller.com.",
		},
		{
			text: "  Tourish does not bear any responsibility for any factual misrepresentation.",
		},
	];

	render = () => (
		<Container style={styles.container}>
			<Header style={{ marginBottom: 0, height: 70 }} />
			<View
				style={{
					width: Constant.WINDOW_WIDTH,
					height: Math.floor(Constant.WINDOW_HEIGHT * 0.3),
				}}
			>
				<Image
					source={require("../assets/images/home-banner.png")}
					resizeMode="cover"
					style={{
						width: Constant.WINDOW_WIDTH,
						height: Math.floor(Constant.WINDOW_HEIGHT * 0.3),
					}}
				/>
			</View>

			<View style={styles.searchForm}>
				<Card style={styles.searchCard}>
					<Formik
						initialValues={{ name: "" }}
						validationSchema={validationSchema}
						onSubmit={this.onSubmit}
						innerRef={this.formikRef}
					>
						{({ handleSubmit, touched, errors, values }) => (
							<>
								<AutoCompleteInput
									label={`${LocalizedText.AIRPORTS} / ${LocalizedText.DESTINATIONS}`}
									value={values.name}
									labelPlace="home"
									data={this.state.searchResult}
									onChangeText={this.onChangeSearchText}
									onClear={this.onClearSearchText}
									isSearching={this.state.isSearching}
									hideResults={this.state.isSearchResultHide}
									error={
										touched.name && errors.name
											? errors.name
											: this.state.notOnBoardedItem
											? LocalizedText.NOT_ONBOARDED_YET_MSG
											: null
									}
									containerStyle={{ zIndex: 9 }}
									renderResultList={this.renderResultList}
								/>

								<Button
									title={LocalizedText.SEARCH}
									style={styles.btn}
									onPress={this.onHandleValidation.bind(this, handleSubmit)}
								/>
								<TouchableOpacity
									activeOpacity={0.4}
									style={{ alignItems: "center", marginTop: 20 }}
									// onPress={this.gotoLowSeasonList}
									onPress={this.showAlert}
								>
									<Text
										style={[styles.regularText, { color: Colors.primaryBg }]}
									>
										{"Explore Low Season Destination?"}
									</Text>
								</TouchableOpacity>
								<CustomAlert
									isVisible={this.state.isAlertVisible}
									title={"Disclaimer"}
									messageParts={this.messageParts}
									buttonContainerStyle={{
										flexDirection: "row",
										justifyContent: "space-between",
										width: "100%",
									}}
									onCancel={this.hideAlert}
									onConfirm={this.gotoLowSeasonList}
								/>
							</>
						)}
					</Formik>
				</Card>
			</View>

			<BottomSheet
				isVisible={this.state.isSignInModalOpen}
				title={LocalizedText.SIGN_IN_WITH_TOURISH}
				style={{
					height: Math.floor(Constant.WINDOW_HEIGHT * 0.55),
					padding: 15,
				}}
				onClose={this.onCloseSignInModal}
			>
				<Text
					style={[styles.lightText, { textAlign: "center", marginTop: -15 }]}
				>
					{`(${LocalizedText.OPTIONAL})`}
				</Text>
				<View style={{ flex: 1, width: "100%" }}>
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<FontAwesomeIcon
								icon={faMap}
								size={30}
								color={Colors.secondary}
							/>
						</View>
						<View style={{ width: "80%" }}>
							<Text style={styles.boldText}>{LocalizedText.TOUR_BOOK}</Text>
							<Text style={styles.lightText}>
								{LocalizedText.TOUR_BOOK_DESCRIPTION}
							</Text>
						</View>
					</View>
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<FontAwesomeIcon
								icon={faFile}
								size={30}
								color={Colors.secondary}
							/>
						</View>
						<View style={{ width: "80%" }}>
							<Text style={styles.boldText}>{LocalizedText.MY_DOCUMENTS}</Text>
							<Text style={styles.lightText}>
								{LocalizedText.MY_DOCUMENTS_DESCRIPTION}
							</Text>
						</View>
					</View>
				</View>
				<Button
					title={LocalizedText.CONTINUE}
					style={styles.continueBtn}
					onPress={this.gotoSignIn}
				/>
				<TouchableOpacity
					style={{ marginBottom: 15 }}
					onPress={this.onCloseSignInModal}
				>
					<Text
						style={[
							styles.boldText,
							{ color: Colors.secondary, textAlign: "center" },
						]}
					>
						{LocalizedText.SKIP}
					</Text>
				</TouchableOpacity>
			</BottomSheet>
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		height: Constant.WINDOW_HEIGHT,
		backgroundColor: Colors.white,
	},
	searchForm: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "flex-start",
	},
	searchCard: {
		width: Constant.WINDOW_WIDTH - 30,
		marginHorizontal: 15,
		marginTop: -10,
		padding: 20,
	},
	searchItemContainer: {
		width: "100%",
		flexDirection: "row",
		padding: 10,
		paddingHorizontal: 8,
	},
	name: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 13,
		fontWeight: "400",
		lineHeight: 19,
		opacity: 0.9,
	},
	cityCountry: {
		fontFamily: "Roboto-Regular",
		color: Colors.secondaryFont,
		fontWeight: "400",
		fontSize: 11,
		lineHeight: 17,
		opacity: 0.8,
	},
	iataCode: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontSize: 13,
		fontWeight: "500",
		opacity: 0.9,
	},
	btn: {
		marginTop: 30,
		width: "100%",
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
		lineHeight: 22,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.9,
		lineHeight: 18,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 15,
		height: "auto",
	},
	iconBox: {
		width: "20%",
		height: "100%",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingTop: 5,
	},
	continueBtn: {
		width: "70%",
		marginBottom: 15,
		height: 45,
		alignSelf: "center",
	},
	regularText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
});
