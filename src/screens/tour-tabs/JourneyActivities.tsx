import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TouchableHighlight,
	Alert,
	Platform,
	FlatList,
	ActivityIndicator,
	Keyboard,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationDot } from "@fortawesome/pro-solid-svg-icons/faLocationDot";
import { faHandshake } from "@fortawesome/pro-solid-svg-icons/faHandshake";
import { faWheelchair } from "@fortawesome/pro-solid-svg-icons/faWheelchair";
import { faCartFlatbedSuitcase } from "@fortawesome/pro-solid-svg-icons/faCartFlatbedSuitcase";
import { faCouch } from "@fortawesome/pro-solid-svg-icons/faCouch";
import { faPlaneUp } from "@fortawesome/pro-solid-svg-icons/faPlaneUp";
import { faCarMirrors } from "@fortawesome/pro-solid-svg-icons/faCarMirrors";
import { faHotel } from "@fortawesome/pro-solid-svg-icons/faHotel";
import { faCalendarDay } from "@fortawesome/pro-solid-svg-icons/faCalendarDay";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faPlus as faPlusLight } from "@fortawesome/pro-light-svg-icons/faPlus";
import { faXmark } from "@fortawesome/pro-regular-svg-icons/faXmark";
import { faFileLines } from "@fortawesome/pro-light-svg-icons/faFileLines";
import { faFileImage } from "@fortawesome/pro-light-svg-icons/faFileImage";
import { faAdd } from "@fortawesome/pro-solid-svg-icons/faAdd";
import { faUpload } from "@fortawesome/pro-light-svg-icons/faUpload";
import { faFolderArrowUp } from "@fortawesome/pro-light-svg-icons/faFolderArrowUp";
import Ripple from "react-native-material-ripple";
import * as mime from "react-native-mime-types";
import Modal from "react-native-modal";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import moment from "moment-timezone";
import { ScrollView } from "react-native-gesture-handler";
import debounce from "lodash.debounce";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import ProductCategory from "../../configs/ProductCategory";
import {
	Loader,
	OverlayLoader,
	Button,
	FilePickerModal,
	NoResult,
	BottomSheet,
	Card,
	AutoCompleteInput,
} from "../../components";
import LocalizedText from "../../resources/LocalizedText";
import JourneyAirportList from "../../components/JourneyAirportList";
import TourLocation from "../../components/TourLocation";
import TourActivity from "../../components/TourActivity";
import { getAirportsByCity, searchCity } from "../../services/ApiService";
import { isEmptyString } from "../../utils/Util";
import {
	RootStackParamList,
	BottomTabParamList,
} from "../../navigation/NavigationTypes";
import AppContext, { SearchItem } from "../../context/AppContext";

const validationSchema = Yup.object().shape({
	locationName: Yup.string()
		.trim()
		.required("Enter location name")
		.min(3, "Minimum 3 character"),
});

const JOURNEY_ACTIVITIES = [
	{ name: "Cab", slug: Constant.CAB_SLUG },
	{ name: "Event", slug: Constant.EVENT_SLUG },
	{ name: "Flight", slug: Constant.FLIGHT_SLUG },
	{ name: "Hotel", slug: Constant.HOTEL_SLUG },
];

type LocationFormModel = {
	locationName: string;
	newLocationId: string;
	oldLocationId: string;
	action: "ADD" | "EDIT";
};

type Props = {
	isLoading: boolean;
	journeyID: string;
	activities: any[];
	navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	>;
	onDeleteActivity: (activityId: string, cityId: string) => void;
	onAddLocation: (
		cityName: string,
		cityId: undefined | string
	) => Promise<boolean>;
	onEditLocation: (
		newCityName: string,
		oldCityId: string,
		newCityId: undefined | string
	) => Promise<boolean>;
	onDeleteLocation: (cityId: string) => void;
	onAddAttachment: (data: any) => void;
	onRemoveActivityAttachment: (activityID: string, filename: string) => void;
	onOpenPdf: (url: string) => void;
	onOpenImage: (url: string) => void;
};

type States = {
	selectedCityID: undefined | string;
	selectedCityName: string;
	selectedActivityID: undefined | string;
	isActivityListOpen: boolean;
	isOverlayModalOpen: boolean;
	cityData: any[];
	autoCompleteDisable: boolean;
	isJourneyAirportListOpen: boolean;
	airports: any[];
	locationFormTitle: string;
	isLocationFormOpen: boolean;
	isSearchingLocation: boolean;
	isAddDocumentModalOpen: boolean;
};

export default class JourneyActivities extends React.Component<Props, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private filepickermodal: React.RefObject<FilePickerModal>;
	private locationScrollViewRef: React.RefObject<ScrollView>;
	private formikRef: React.RefObject<FormikProps<LocationFormModel>>;
	private focusListner: any;

	constructor(props: Props) {
		super(props);

		this.state = {
			selectedCityID: undefined,
			selectedCityName: "",
			selectedActivityID: undefined,
			isActivityListOpen: false,
			isOverlayModalOpen: false,
			cityData: [],
			autoCompleteDisable: true,
			isJourneyAirportListOpen: false,
			airports: [],
			locationFormTitle: LocalizedText.ADD_LOCATION,
			isLocationFormOpen: false,
			isSearchingLocation: false,
			isAddDocumentModalOpen: false,
		};

		this.filepickermodal = React.createRef();
		this.locationScrollViewRef = React.createRef();
		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount() {
		this.focusListner();
	}

	onFocusScreen = () => {
		const { airports } = this.state;
		if (airports.length > 0) {
			this.setState({ isJourneyAirportListOpen: true });
		}
	};

	getDescription = (item: any): Array<string> => {
		const description: string[] = [];
		switch (item.activity_slug) {
			case Constant.CAB_SLUG:
				description.push(
					item.serviceProvider,
					moment.utc(item.datetime).format("Do MMM, YYYY HH:mm")
				);
				break;

			case ProductCategory.CAR_RENTAL:
				description.push(
					item.serviceProvider,
					moment.utc(item.datetime).format("dddd, MMMM D, YYYY, hh:mm a"),
					`Booking Ref. No. - #${item.orderNumber}`
				);
				break;

			case Constant.EVENT_SLUG:
				description.push(
					item.eventName,
					item.eventLocation,
					moment.utc(item.datetime).format("Do MMM, YYYY HH:mm")
				);
				break;

			case Constant.FLIGHT_SLUG:
				description.push(
					item.origin.iataCode +
						(item.departureTerminal
							? " (T-" +
							  item.departureTerminal.toLowerCase().replace("t", "") +
							  ")"
							: " (N/A)") +
						" - " +
						item.destination.iataCode +
						(item.arrivalTerminal
							? " (T-" +
							  item.arrivalTerminal.toLowerCase().replace("t", "") +
							  ")"
							: " (N/A)")
				);
				if (item.airlineName !== null) {
					description.push(`${item.airlineName}`);
				}
				if (item.flightNo !== null && item.flightCode !== null) {
					description.push(`${item.flightCode} ${item.flightNo}`);
				}
				if (item.arrivalTime === null) {
					description.push(
						moment.utc(item.datetime).format("Do MMM, YYYY HH:mm")
					);
				} else {
					description.push(
						moment.utc(item.datetime).format("Do MMM, YYYY HH:mm") +
							" - " +
							moment.utc(item.arrivalTime, "HH:mm:ss").format("HH:mm")
					);
				}
				break;

			case Constant.HOTEL_SLUG:
				description.push(
					item.hotelName,
					`${moment.utc(item.checkInDate).format("Do MMM, YYYY")} - ${moment
						.utc(item.checkOutDate)
						.format("Do MMM, YYYY")}`
				);
				break;

			case ProductCategory.MEET_AND_GREET:
			case ProductCategory.MOBILITY_ASSIST:
			case ProductCategory.LOUNGE:
			case ProductCategory.PORTER:
				description.push(
					`${moment.utc(item.startTime, "HH:mm:ss").format("HH:mm")} - ${moment
						.utc(item.endTime, "HH:mm:ss")
						.format("HH:mm")}`,
					`${moment.utc(item.date).format("Do MMM, YYYY")}`,
					`Booking Ref. No. - #${item.orderNumber}`
				);
				break;

			default:
				break;
		}
		return description;
	};

	getCityWiseActivities = (): any[] => {
		const { activities } = this.props;
		const nonEmptyActivities = activities.filter(
			(item) => item.activity_slug !== null
		);

		const emptyActivities = activities.filter(
			(item) => item.activity_slug === null
		);
		// const sortedActivities = nonEmptyActivities.sort(
		// 	(a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
		// );

		const modDate: Array<any> = [];

		nonEmptyActivities.forEach((item: any) => {
			if (
				[
					ProductCategory.LOUNGE,
					ProductCategory.MEET_AND_GREET,
					ProductCategory.MOBILITY_ASSIST,
					ProductCategory.PORTER,
				].includes(item.activity_slug)
			) {
				const date = moment(item.datetime).format("YYYY-MM-DD");
				modDate.push({
					...item,
					datetime: moment(
						`${date} ${item.startTime}`,
						"YYYY-MM-DD HH:mm:ss"
					).format("YYYY-MM-DD HH:mm:ss"),
				});
			} else {
				const date = moment.utc(item.datetime).format("YYYY-MM-DD HH:mm:ss");
				modDate.push({
					...item,
					datetime: moment
						.utc(`${date}`, "YYYY-MM-DD HH:mm:ss")
						.format("YYYY-MM-DD HH:mm:ss"),
				});
			}
		});

		const sortedActivities = modDate.sort((a, b) => {
			const date1: any = new Date(a.datetime).getTime();
			const date2: any = new Date(b.datetime).getTime();
			return date1 - date2;
		});

		const allActivities = [...sortedActivities, ...emptyActivities];

		let preparedActivities: any[] = [];
		let lastCityID: null | string = null;

		allActivities.forEach((item: any, index: number) => {
			if (item.city_id === lastCityID) {
				let lastIndex = preparedActivities.length - 1;
				let preparedActivityItem = preparedActivities[lastIndex];
				let updatedActivities = preparedActivityItem.activities;

				if (item.activity_slug !== null) {
					updatedActivities.push({
						...item,
						description: this.getDescription(item),
					});
				}

				preparedActivityItem.activities = updatedActivities;
				preparedActivities[lastIndex] = preparedActivityItem;
			} else {
				preparedActivities.push({
					city_id: item.city_id,
					city_name: item.city_name,
					activities:
						item.activity_slug === null
							? []
							: [{ ...item, description: this.getDescription(item) }],
				});
			}

			lastCityID = item.city_id;
		});

		return preparedActivities;
	};

	getAllCities = (): any[] => {
		const { activities } = this.props;
		const nonEmptyActivities = activities.filter(
			(item) => item.activity_slug !== null
		);
		const emptyActivities = activities.filter(
			(item) => item.activity_slug === null
		);
		const sortedActivities = nonEmptyActivities.sort(
			(a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
		);

		const allActivities = [...sortedActivities, ...emptyActivities];
		const preparedCities: any[] = [];

		allActivities.forEach((item) => {
			let cityID = item.city_id;
			let index = preparedCities.findIndex(
				(element: any) => element.city_id === cityID
			);
			if (index === -1) {
				preparedCities.push({
					city_id: cityID,
					city_name: item.city_name,
				});
			}
		});

		return preparedCities;
	};

	getActivityIcon = (activitySlug: string): any => {
		let icon = null;
		switch (activitySlug) {
			case ProductCategory.MEET_AND_GREET:
				icon = faHandshake;
				break;
			case ProductCategory.MOBILITY_ASSIST:
				icon = faWheelchair;
				break;
			case ProductCategory.PORTER:
				icon = faCartFlatbedSuitcase;
				break;
			case ProductCategory.LOUNGE:
				icon = faCouch;
				break;
			case Constant.FLIGHT_SLUG:
				icon = faPlaneUp;
				break;
			case Constant.CAB_SLUG:
			case ProductCategory.CAR_RENTAL:
				icon = faCarMirrors;
				break;
			case Constant.HOTEL_SLUG:
				icon = faHotel;
				break;
			case Constant.EVENT_SLUG:
				icon = faCalendarDay;
				break;
			default:
				break;
		}
		return icon;
	};

	openActivityList = () => {
		const allCities: any[] = this.getAllCities();
		if (allCities.length > 0) {
			const lastIndex = allCities.length - 1;
			this.setState({
				isActivityListOpen: true,
				selectedCityID: allCities[lastIndex].city_id,
				selectedCityName: allCities[lastIndex].city_name,
			});
		} else {
			this.setState({
				isActivityListOpen: true,
				selectedCityID: undefined,
				selectedCityName: "",
			});
		}
	};

	onActivityListOpened = () => {
		this.locationScrollViewRef &&
			this.locationScrollViewRef.current?.scrollToEnd({
				animated: true,
			});
	};

	closeActivityList = () => {
		this.setState({
			isActivityListOpen: false,
			selectedCityID: undefined,
			selectedCityName: "",
		});
	};

	selectLocation = (index: number, item: any) => {
		this.setState(
			{
				selectedCityID: item.city_id,
				selectedCityName: item.city_name,
			},
			() => {
				this.locationScrollViewRef &&
					this.locationScrollViewRef.current?.scrollTo({
						x: index * 100,
						y: 0,
						animated: true,
					});
			}
		);
	};

	onActivityItemSelect = (activitySlug: string, activityName: string) => {
		const { selectedCityID, selectedCityName } = this.state;
		if (typeof selectedCityID !== "undefined") {
			switch (activitySlug) {
				case Constant.CAB_SLUG:
					this.setState({ isActivityListOpen: false }, () => {
						this.props.navigation.navigate("ManageCabActivity", {
							journeyId: this.props.journeyID,
							cityId: selectedCityID,
							cityName: selectedCityName,
							activityName: activityName,
							activitySlug: activitySlug,
						});
					});
					break;
				case Constant.EVENT_SLUG:
					this.setState({ isActivityListOpen: false }, () => {
						this.props.navigation.navigate("ManageEventActivity", {
							journeyId: this.props.journeyID,
							cityId: selectedCityID,
							cityName: selectedCityName,
							activityName: activityName,
							activitySlug: activitySlug,
						});
					});
					break;
				case Constant.FLIGHT_SLUG:
					this.setState({ isActivityListOpen: false }, () => {
						this.props.navigation.navigate("ManageFlightSearch", {
							journeyId: this.props.journeyID,
							activityName: activityName,
							activitySlug: activitySlug,
						});
						// this.props.navigation.navigate("ManageFlightActivity", {
						// 	journeyId: this.props.journeyID,
						// 	cityId: selectedCityID,
						// 	cityName: selectedCityName,
						// 	activityName: activityName,
						// 	activitySlug: activitySlug,
						// });
					});
					break;
				case Constant.HOTEL_SLUG:
					this.setState({ isActivityListOpen: false }, () => {
						this.props.navigation.navigate("ManageHotelActivity", {
							journeyId: this.props.journeyID,
							cityId: selectedCityID,
							cityName: selectedCityName,
							activityName: activityName,
							activitySlug: activitySlug,
						});
					});
					break;
				default:
					break;
			}
		} else {
			Alert.alert("Warning", "Please select a location");
		}
	};

	openAddAttachmentModal = (id: string) => {
		this.setState({ selectedActivityID: id }, () => {
			this.filepickermodal && this.filepickermodal.current?.open();
		});
	};

	openImageView = (uri: string) => {
		const { onOpenImage } = this.props;
		onOpenImage(uri);
	};

	openPdf = (url: string) => {
		const { onOpenPdf } = this.props;
		onOpenPdf(url);
	};

	openAirportWebsite = (cityID: string) => {
		setTimeout(() => {
			this.setState({ isOverlayModalOpen: true }, () => {
				getAirportsByCity(cityID)
					.then((response) => {
						if (response.check === true) {
							let airportsArr: any[] = response.data;
							if (airportsArr.length > 1) {
								this.setState({
									isOverlayModalOpen: false,
									isJourneyAirportListOpen: true,
									airports: airportsArr,
								});
							} else if (airportsArr.length === 1) {
								let airportData = airportsArr[0];
								this.setState({ isOverlayModalOpen: false }, () => {
									const { searchData } = this.context;
									const data: Array<SearchItem> = [...searchData];
									data.push({
										name: airportData.name,
										type: Constant.SEARCH_ITEM_TYPE_AIRPORT,
										sourceId: airportData._id,
										country: airportData.country.name,
										city: airportData.city.name,
										iataCode: airportData.iata_code,
									});
									this.context.setSearchData(data);

									setTimeout(() => {
										this.props.navigation.navigate("AirportInfo", {
											airportId: airportData._id,
											isOnBoard: airportData.isOnBoard,
										});
									}, 350);
								});
							} else {
								this.setState({ isOverlayModalOpen: false }, () => {
									Alert.alert("Sorry", "Airport not found");
								});
							}
						} else {
							this.setState({ isOverlayModalOpen: false }, () => {
								Alert.alert("Sorry", response.message);
							});
						}
					})
					.catch((error) => {
						this.setState({ isOverlayModalOpen: false });
					});
			});
		}, 350);
	};

	onAirportSelect = (data: any) => {
		this.setState({ isJourneyAirportListOpen: false }, () => {
			const { searchData } = this.context;
			const arr: Array<SearchItem> = [...searchData];
			arr.push({
				name: data.name,
				type: Constant.SEARCH_ITEM_TYPE_AIRPORT,
				sourceId: data._id,
				country: data.country.name,
				city: data.city.name,
				iataCode: data.iata_code,
			});
			this.context.setSearchData(arr);

			setTimeout(() => {
				this.props.navigation.navigate("AirportInfo", {
					airportId: data._id,
					isOnBoard: data.isOnBoard,
				});
			}, 300);
		});
	};

	closeAirportList = () => {
		this.setState({
			isJourneyAirportListOpen: false,
			airports: [],
		});
	};

	openLocationAddForm = () => {
		this.setState({ isActivityListOpen: false }, () => {
			setTimeout(() => {
				this.setState(
					{
						locationFormTitle: LocalizedText.ADD_LOCATION,
						isLocationFormOpen: true,
					},
					() => {
						this.formikRef &&
							this.formikRef.current?.setFieldValue("action", "ADD");
						this.formikRef &&
							this.formikRef.current?.setFieldValue("locationName", "");
						this.formikRef &&
							this.formikRef.current?.setFieldValue("newLocationId", "");
						this.formikRef &&
							this.formikRef.current?.setFieldValue("oldLocationId", "");
					}
				);
			}, 300);
		});
	};

	openLocationEditForm = (locationId: string, locationName: string) => {
		setTimeout(() => {
			this.setState(
				{
					locationFormTitle: LocalizedText.EDIT_LOCATION,
					isLocationFormOpen: true,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue("action", "EDIT");
					this.formikRef &&
						this.formikRef.current?.setFieldValue("locationName", locationName);
					this.formikRef &&
						this.formikRef.current?.setFieldValue("newLocationId", locationId);
					this.formikRef &&
						this.formikRef.current?.setFieldValue("oldLocationId", locationId);
				}
			);
		}, 500);
	};

	closeLocationAddForm = () => {
		this.setState({ isLocationFormOpen: false, cityData: [] }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("action", "ADD");
			this.formikRef &&
				this.formikRef.current?.setFieldValue("locationName", "");
			this.formikRef &&
				this.formikRef.current?.setFieldValue("newLocationId", "");
			this.formikRef &&
				this.formikRef.current?.setFieldValue("oldLocationId", "");
		});
	};

	onChangeLocationName = (value: string) => {
		let trimValue: string = value.trim();
		this.formikRef &&
			this.formikRef.current?.setFieldValue("locationName", value);
		this.formikRef &&
			this.formikRef.current?.setFieldValue("newLocationId", "");

		if (trimValue.length > 2) {
			let debounceFunction = debounce(
				() => {
					this.onSearchLocation(value);
				},
				500,
				{ maxWait: 1 }
			);
			debounceFunction();
		} else {
			this.setState({
				isSearchingLocation: false,
				autoCompleteDisable: true,
				cityData: [],
			});
		}
	};

	onSearchLocation = (value: string) => {
		this.setState({ isSearchingLocation: true }, () => {
			searchCity(value)
				.then((response: any) => {
					this.setState({
						cityData: response.data,
						autoCompleteDisable: false,
						isSearchingLocation: false,
					});
				})
				.catch((error) => {
					this.setState({
						isSearchingLocation: false,
						autoCompleteDisable: true,
					});
				});
		});
	};

	onClearSearchText = () => {
		Keyboard.dismiss();
		this.setState({ autoCompleteDisable: true }, () => {
			this.formikRef && this.formikRef.current?.resetForm();
		});
	};

	onSelectLocationItem = (item: any) => {
		this.setState({ autoCompleteDisable: true }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("locationName", item.name);
			this.formikRef &&
				this.formikRef.current?.setFieldValue("newLocationId", item._id);
		});
	};

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			activeOpacity={0.5}
			underlayColor={Colors.rippleColor}
			onPress={this.onSelectLocationItem.bind(this, item)}
		>
			<View
				style={{
					padding: 10,
					borderWidth: 0,
					borderBottomWidth: 1,
					borderBottomColor: Colors.lightBorder,
					backgroundColor: Colors.white,
				}}
			>
				<Text
					style={{
						color: Colors.primaryFont,
						fontFamily: "Roboto-Regular",
						fontSize: 13,
						fontWeight: "400",
						lineHeight: 19,
					}}
				>
					{item.name}
				</Text>
				<Text
					style={{
						color: Colors.black,
						fontFamily: "Roboto-Regular",
						fontSize: 11,
						fontWeight: "400",
						lineHeight: 16,
					}}
				>
					{`${item.state.name}, ${item.country.name}`}
				</Text>
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
				zIndex: 99,
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
			/>
		</View>
	);

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmitLocationForm = (values: LocationFormModel) => {
		if (isEmptyString(values.newLocationId)) {
			Alert.alert(
				LocalizedText.WARNING,
				LocalizedText.ADD_LOACTION_WARNING_MSG,
				[
					{ text: LocalizedText.NO, style: "cancel" },
					{
						text: LocalizedText.YES,
						onPress: () => {
							if (values.action === "ADD") {
								this.addNewLocation(values.locationName, undefined);
							} else {
								this.editLocation(
									values.locationName,
									values.oldLocationId,
									undefined
								);
							}
						},
					},
				]
			);
		} else {
			if (values.action === "ADD") {
				this.addNewLocation(values.locationName, values.newLocationId);
			} else {
				this.editLocation(
					values.locationName,
					values.oldLocationId,
					values.newLocationId
				);
			}
		}
	};

	addNewLocation = (locationName: string, locationId: undefined | string) => {
		const { onAddLocation } = this.props;
		onAddLocation(locationName, locationId)
			.then((result) => {
				this.setState({ isLocationFormOpen: false }, () => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue("locationName", "");
					this.formikRef &&
						this.formikRef.current?.setFieldValue("newLocationId", "");
					this.formikRef &&
						this.formikRef.current?.setFieldValue("oldLocationId", "");
				});
			})
			.catch((error) => {});
	};

	editLocation = (
		locationName: string,
		oldLocationId: string,
		newLocationId: undefined | string
	) => {
		const { onEditLocation } = this.props;
		onEditLocation(locationName, oldLocationId, newLocationId)
			.then((result) => {
				this.setState({ isLocationFormOpen: false }, () => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue("locationName", "");
					this.formikRef &&
						this.formikRef.current?.setFieldValue("newLocationId", "");
					this.formikRef &&
						this.formikRef.current?.setFieldValue("oldLocationId", "");
				});
			})
			.catch((error) => {});
	};

	deleteLocation = (locationId: string) => {
		Alert.alert(
			LocalizedText.WARNING,
			LocalizedText.DELETE_LOCATION_WARNING_MSG,
			[
				{ text: LocalizedText.NO, style: "cancel" },
				{
					text: LocalizedText.YES,
					onPress: () => {
						const { onDeleteLocation } = this.props;
						onDeleteLocation(locationId);
					},
				},
			]
		);
	};

	onRemoveFile = (activityID: string, filename: string) => {
		Alert.alert(LocalizedText.REMOVE_DOC, LocalizedText.REMOVE_DOC_ALERT, [
			{ text: LocalizedText.NO, style: "cancel" },
			{
				text: LocalizedText.YES,
				onPress: () => {
					const { onRemoveActivityAttachment } = this.props;
					if (
						typeof onRemoveActivityAttachment !== "undefined" &&
						typeof onRemoveActivityAttachment === "function"
					) {
						onRemoveActivityAttachment(activityID, filename);
					}
				},
			},
		]);
	};

	onSelectImage = (data: any) => {
		const { onAddAttachment } = this.props;
		if (
			typeof onAddAttachment !== "undefined" &&
			typeof onAddAttachment === "function"
		) {
			onAddAttachment({
				activity_id: this.state.selectedActivityID,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	onCaptureImage = (data: any) => {
		const { onAddAttachment } = this.props;
		if (
			typeof onAddAttachment !== "undefined" &&
			typeof onAddAttachment === "function"
		) {
			onAddAttachment({
				activity_id: this.state.selectedActivityID,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	onSelectDocument = (data: any) => {
		const { onAddAttachment } = this.props;
		if (
			typeof onAddAttachment !== "undefined" &&
			typeof onAddAttachment === "function"
		) {
			onAddAttachment({
				activity_id: this.state.selectedActivityID,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	gotoEditActivity = (cityId: string, cityName: string, activity: any) => {
		const params: any = {
			journeyId: this.props.journeyID,
			cityId: cityId,
			cityName: cityName,
			activityId: activity._id,
			activityName: activity.activity_name,
			activitySlug: activity.activity_slug,
		};

		switch (activity.activity_slug) {
			case Constant.CAB_SLUG:
				params.serviceProvider = activity.serviceProvider;
				params.date = moment(activity.date).format("YYYY-MM-DD");
				if (activity.time !== null) {
					params.time = activity.time;
				}
				this.props.navigation.navigate("ManageCabActivity", params);
				break;

			case Constant.EVENT_SLUG:
				params.eventName = activity.eventName;
				params.eventLocation = activity.eventLocation;
				params.eventDate = moment(activity.eventDate).format("YYYY-MM-DD");
				if (activity.time !== null) {
					params.eventTime = activity.eventTime;
				}
				this.props.navigation.navigate("ManageEventActivity", params);
				break;

			// case Constant.FLIGHT_SLUG:
			// 	params.origin = activity.origin;
			// 	params.destination = activity.destination;
			// 	params.departureDate = moment(activity.departureDate).format(
			// 		"YYYY-MM-DD"
			// 	);
			// 	params.departureTime = activity.departureTime;
			// 	if (activity.arrivalTime !== null) {
			// 		params.arrivalTime = activity.arrivalTime;
			// 	}
			// 	if (activity.airlineName !== null) {
			// 		params.airlineName = activity.airlineName;
			// 	}
			// 	if (activity.flightNo !== null) {
			// 		params.flightNo = activity.flightNo;
			// 	}
			// 	this.props.navigation.navigate("ManageFlightActivity", params);
			// 	break;

			case Constant.FLIGHT_SLUG:
				params.date = moment(activity.departureDate).format("YYYY-MM-DD");

				if (activity.flightNo !== null) {
					params.flightNo = activity.flightNo;
				}
				if (activity.airlineName !== null) {
					params.airlineName = activity.airlineName;
				}
				if (activity.flightCode !== null) {
					params.flightCode = activity.flightCode;
				}
				this.props.navigation.navigate("ManageFlightSearch", params);
				break;

			case Constant.HOTEL_SLUG:
				params.hotelName = activity.hotelName;
				params.checkInDate = moment(activity.checkInDate).format("YYYY-MM-DD");
				if (activity.checkInTime !== null) {
					params.checkInTime = activity.checkInTime;
				}
				params.checkOutDate = moment(activity.checkOutDate).format(
					"YYYY-MM-DD"
				);
				this.props.navigation.navigate("ManageHotelActivity", params);
				break;

			default:
				break;
		}
	};

	gotoOrderDetails = (
		orderId: string,
		orderNumber: string,
		orderItemId: string
	) => {
		this.props.navigation.navigate("OrderDetails", {
			orderId: orderId,
			orderNo: orderNumber,
			orderItemId: orderItemId,
		});
	};

	deleteActivity = (activityId: string, cityId: string) => {
		Alert.alert(
			LocalizedText.DELETE_ACTIVITY,
			LocalizedText.DELETE_ACTIVITY_WARNING_MSG,
			[
				{ text: LocalizedText.NO, style: "cancel" },
				{
					text: LocalizedText.YES,
					onPress: () => {
						this.props.onDeleteActivity(activityId, cityId);
					},
				},
			]
		);
	};

	// openDocumentModal = (id: string) => {
	// 	this.setState({ selectedActivityID: id, isAddDocumentModalOpen: true });
	// };

	// closeDocumentModal = () => {
	// 	this.setState({ isAddDocumentModalOpen: false });
	// };

	gotoMyDocuments = () => {
		this.props.navigation.navigate("MyDocuments", {
			type: "upload",
			journey_id: this.props.journeyID,
			activityId: this.state.selectedActivityID,
		});
	};

	render = () => {
		const { isLoading } = this.props;
		if (isLoading) {
			return <Loader />;
		} else {
			const cityActivityData: any[] = this.getCityWiseActivities();
			return (
				<View style={{ flex: 1, width: "100%" }}>
					{cityActivityData.length > 0 ? (
						<View style={styles.tabComponent}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								nestedScrollEnabled={true}
							>
								{cityActivityData.map((item, cityIndex) => {
									const activities = item.activities || [];
									const isLastCity = cityIndex + 1 === cityActivityData.length;
									return (
										<View
											key={cityIndex.toString()}
											style={[
												styles.locationWrapper,
												cityIndex === 0 ? { marginTop: 25 } : null,
											]}
										>
											<View
												style={[
													styles.locationBox,
													isLastCity && activities.length === 0
														? { borderLeftWidth: 0 }
														: null,
												]}
											>
												<TourLocation
													name={item.city_name}
													onEdit={this.openLocationEditForm.bind(
														this,
														item.city_id,
														item.city_name
													)}
													onOpenAirports={this.openAirportWebsite.bind(
														this,
														item.city_id
													)}
													onDelete={this.deleteLocation.bind(
														this,
														item.city_id
													)}
												/>
												{activities.map((element: any, index: number) => {
													const isLastActivity =
														index + 1 === activities.length;
													const canGotoOrderDetails = element.orderId !== null;
													return (
														<View
															key={element._id.toString()}
															style={[
																styles.activityBox,
																index === 0 ? { marginTop: 30 } : null,
																isLastActivity ? { paddingBottom: 15 } : null,
																isLastCity && isLastActivity
																	? {
																			marginLeft: -2,
																			borderLeftWidth: 0,
																			borderLeftColor: Colors.white,
																			backgroundColor: Colors.white,
																			paddingLeft: 27,
																	  }
																	: null,
															]}
														>
															<TourActivity
																activeOpacity={canGotoOrderDetails ? 0.5 : 1}
																cityId={item.city_id}
																name={element.activity_name}
																description={element.description}
																activity={element}
																isCancelled={
																	typeof element.isCancelled !== "undefined"
																		? element.isCancelled
																		: null
																}
																departureGate={
																	typeof element.departureGate !== "undefined"
																		? element.departureGate
																		: null
																}
																flightStatus={
																	typeof element.flightStatus !== "undefined"
																		? element.flightStatus
																		: null
																}
																onEdit={this.gotoEditActivity.bind(
																	this,
																	item.city_id,
																	item.city_name,
																	element
																)}
																onDelete={this.deleteActivity.bind(
																	this,
																	element._id,
																	item.city_id
																)}
																onPress={
																	canGotoOrderDetails
																		? this.gotoOrderDetails.bind(
																				this,
																				element.orderId,
																				element.orderNumber,
																				element.orderItemId
																		  )
																		: undefined
																}
															/>

															{(element.attachments || []).length > 0 ? (
																<View style={styles.docChipWrapper}>
																	{(element.attachments || []).map(
																		(doc: any, ind: number) => {
																			let isPdf =
																				mime.lookup(doc.file) ===
																				Constant.PDF_MIME_TYPE;
																			return (
																				// <View
																				// 	style={styles.docChip}
																				// 	key={`documnet_${ind.toString()}`}
																				// >
																				// 	<TouchableOpacity
																				// 		key={doc.file}
																				// 		style={{
																				// 			flexDirection: "row",
																				// 		}}
																				// 		onPress={
																				// 			isPdf
																				// 				? this.openPdf.bind(
																				// 						this,
																				// 						doc.uri
																				// 				  )
																				// 				: this.openImageView.bind(
																				// 						this,
																				// 						doc.uri
																				// 				  )
																				// 		}
																				// 	>
																				// 		<FontAwesomeIcon
																				// 			size={16}
																				// 			icon={
																				// 				isPdf
																				// 					? faFileLines
																				// 					: faFileImage
																				// 			}
																				// 			color={Colors.mediumGrey}
																				// 		/>
																				// 		<Text style={styles.docTitle}>
																				// 			{doc.name}
																				// 		</Text>
																				// 	</TouchableOpacity>

																				// 	<TouchableOpacity
																				// 		style={{
																				// 			marginLeft: 12,
																				// 		}}
																				// 		onPress={this.onRemoveFile.bind(
																				// 			this,
																				// 			element._id,
																				// 			doc.file
																				// 		)}
																				// 	>
																				// 		<FontAwesomeIcon
																				// 			size={16}
																				// 			icon={faXmark}
																				// 			color={Colors.danger}
																				// 		/>
																				// 	</TouchableOpacity>
																				// </View>
																				<View
																					style={styles.docChip}
																					key={`document_${ind.toString()}`}
																				>
																					<TouchableOpacity
																						key={doc.file}
																						style={{
																							flexDirection: "row",
																						}}
																						onPress={
																							isPdf
																								? this.openPdf.bind(
																										this,
																										doc.uri
																								  )
																								: this.openImageView.bind(
																										this,
																										doc.uri
																								  )
																						}
																					>
																						<FontAwesomeIcon
																							size={18}
																							icon={
																								isPdf
																									? faFileLines
																									: faFileImage
																							}
																							color={Colors.mediumGrey}
																							style={{ marginRight: 8 }}
																						/>
																						<Text
																							style={[
																								styles.docTitle,
																								{
																									flexShrink: 1,
																								},
																							]}
																							numberOfLines={1} // Truncates text if too long
																							ellipsizeMode="tail" // Adds "..." at the end if text is truncated
																						>
																							{doc.name}
																						</Text>
																					</TouchableOpacity>

																					<TouchableOpacity
																						style={{
																							marginLeft: 8,
																						}}
																						onPress={this.onRemoveFile.bind(
																							this,
																							element._id,
																							doc.file
																						)}
																					>
																						<FontAwesomeIcon
																							size={18}
																							icon={faXmark}
																							color={Colors.danger}
																						/>
																					</TouchableOpacity>
																				</View>
																			);
																		}
																	)}
																</View>
															) : null}

															{[
																Constant.FLIGHT_SLUG,
																Constant.CAB_SLUG,
																Constant.HOTEL_SLUG,
																Constant.EVENT_SLUG,
															].includes(element.activity_slug) ? (
																<TouchableOpacity
																	style={styles.attachmentBtn}
																	onPress={this.openAddAttachmentModal.bind(
																		this,
																		element._id
																	)}
																	// onPress={this.openDocumentModal.bind(
																	// 	this,
																	// 	element._id
																	// )}
																>
																	<FontAwesomeIcon
																		size={10}
																		icon={faAdd}
																		color={Colors.primaryBtn}
																	/>
																	<Text style={styles.docText}>
																		Add document
																	</Text>
																</TouchableOpacity>
															) : null}
															<View
																style={[
																	styles.activityIndicator,
																	{
																		position: "absolute",
																		left: -14,
																		top: 0,
																		backgroundColor: Colors.white,
																	},
																	isLastCity && isLastActivity
																		? { left: -13 }
																		: null,
																]}
															>
																<View style={styles.activityIndicator}>
																	<FontAwesomeIcon
																		size={13}
																		icon={this.getActivityIcon(
																			element.activity_slug
																		)}
																		color={Colors.secondary}
																	/>
																</View>
															</View>
														</View>
													);
												})}
											</View>
											<View style={styles.locationIndicator}>
												<FontAwesomeIcon
													size={20}
													icon={faLocationDot}
													color={Colors.white}
												/>
											</View>
										</View>
									);
								})}
							</ScrollView>
						</View>
					) : (
						<NoResult title={LocalizedText.NO_RESULR_FOUND} />
					)}

					{/* @ts-ignore */}
					<Ripple
						rippleColor={Colors.rippleColor}
						rippleDuration={550}
						rippleOpacity={0.54}
						rippleContainerBorderRadius={25}
						onPress={this.openActivityList}
						style={styles.fabBtn}
					>
						<FontAwesomeIcon size={25} icon={faPlus} color={Colors.white} />
					</Ripple>

					<Modal
						isVisible={this.state.isActivityListOpen}
						statusBarTranslucent={true}
						useNativeDriver={true}
						useNativeDriverForBackdrop={true}
						hideModalContentWhileAnimating={true}
						deviceHeight={Constant.SCREEN_HEIGHT}
						deviceWidth={Constant.SCREEN_WIDTH}
						style={styles.modalOverlay}
						backdropColor={"rgba(0,0,0,0.5)"}
						backdropOpacity={1}
						animationInTiming={300}
						animationOutTiming={200}
						animationOut="fadeOut"
						backdropTransitionOutTiming={200}
						onBackButtonPress={this.closeActivityList}
						onModalShow={this.onActivityListOpened}
					>
						<View style={styles.activityModalContainer}>
							<View style={styles.modalHeader}>
								<Text style={styles.heading}>{LocalizedText.ADD_ACTIVITY}</Text>
								<TouchableHighlight
									style={styles.modalCloseBtn}
									onPress={this.closeActivityList}
									underlayColor={Colors.lightGrey}
								>
									<FontAwesomeIcon
										icon={faXmark}
										size={20}
										color={Colors.mediumGrey}
									/>
								</TouchableHighlight>
							</View>

							<Text style={[styles.lightLabel, { marginBottom: 8 }]}>
								{LocalizedText.LOCATIONS}
							</Text>
							<View
								style={{
									height: 60,
									width: "100%",
									flexDirection: "row",
								}}
							>
								<ScrollView
									ref={this.locationScrollViewRef}
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ alignItems: "center" }}
								>
									{this.getAllCities().map((item: any, index: number) => (
										<TouchableHighlight
											key={item.city_id}
											underlayColor={Colors.lightGrey}
											style={{
												flexDirection: "row",
												alignItems: "center",
												paddingHorizontal: 15,
												paddingVertical: 10,
												borderRadius: 30,
												backgroundColor:
													item.city_id === this.state.selectedCityID
														? Colors.secondaryAlpha1
														: Colors.white,
											}}
											onPress={this.selectLocation.bind(this, index, item)}
										>
											<>
												<View
													style={[
														styles.listActivityAvatar,
														{ backgroundColor: Colors.secondary },
													]}
												>
													<FontAwesomeIcon
														icon={faLocationDot}
														size={18}
														color={Colors.white}
													/>
												</View>
												<Text
													style={[
														styles.activityName,
														{ marginBottom: 0 },
														item.city_id === this.state.selectedCityID
															? {
																	fontFamily: "Roboto-Medium",
																	fontWeight: "500",
																	fontSize: 16,
															  }
															: null,
													]}
												>
													{item.city_name}
												</Text>
											</>
										</TouchableHighlight>
									))}

									<TouchableOpacity
										style={styles.addLocationBtn}
										onPress={this.openLocationAddForm}
									>
										<FontAwesomeIcon
											size={15}
											icon={faPlusLight}
											color={Colors.primaryBtn}
										/>
										<Text
											style={[
												styles.lightLabel,
												{ fontSize: 12, color: Colors.primaryBtn },
											]}
										>
											{` ${LocalizedText.ADD}`}
										</Text>
									</TouchableOpacity>
								</ScrollView>
							</View>

							{typeof this.state.selectedCityID !== "undefined" ? (
								<>
									<Text style={[styles.lightLabel, { marginTop: 20 }]}>
										{LocalizedText.ACTIVITIES}
									</Text>
									<View
										style={{ flex: 1, width: "100%", paddingHorizontal: 10 }}
									>
										<ScrollView
											showsVerticalScrollIndicator={false}
											keyboardShouldPersistTaps="handled"
										>
											{JOURNEY_ACTIVITIES.map((item) => (
												<TouchableHighlight
													key={item.slug}
													underlayColor={Colors.lightGrey}
													style={styles.listActivityItem}
													onPress={this.onActivityItemSelect.bind(
														this,
														item.slug,
														item.name
													)}
												>
													<>
														<View style={styles.listActivityAvatar}>
															<FontAwesomeIcon
																icon={this.getActivityIcon(item.slug)}
																size={16}
																color={Colors.secondary}
															/>
														</View>
														<Text
															style={[styles.activityName, { marginBottom: 0 }]}
														>
															{item.name}
														</Text>
													</>
												</TouchableHighlight>
											))}
										</ScrollView>
									</View>
								</>
							) : null}
						</View>
					</Modal>

					<BottomSheet
						title={this.state.locationFormTitle}
						isVisible={this.state.isLocationFormOpen}
						onClose={this.closeLocationAddForm}
						style={{
							paddingHorizontal: 15,
							height: Math.floor(Constant.WINDOW_HEIGHT * 0.6),
						}}
					>
						<Formik
							innerRef={this.formikRef}
							initialValues={{
								action: "ADD",
								locationName: "",
								newLocationId: "",
								oldLocationId: "",
							}}
							validationSchema={validationSchema}
							onSubmit={this.onSubmitLocationForm}
						>
							{({ handleSubmit, touched, errors, values }) => (
								<View style={{ flex: 1, width: "100%", zIndex: 1 }}>
									<AutoCompleteInput
										label={LocalizedText.LOCATION}
										value={values.locationName}
										data={this.state.cityData}
										onChangeText={this.onChangeLocationName}
										onClear={this.onClearSearchText}
										isSearching={this.state.isSearchingLocation}
										hideResults={this.state.autoCompleteDisable}
										error={
											touched.locationName && errors.locationName
												? errors.locationName
												: null
										}
										renderResultList={(listProps: any) => {
											const data: any[] = listProps.data;
											return (
												<View>
													{data.map((item: any, index: number) => (
														<TouchableHighlight
															key={item._id}
															activeOpacity={0.5}
															underlayColor={Colors.rippleColor}
															onPress={this.onSelectLocationItem.bind(
																this,
																item
															)}
														>
															<View
																style={{
																	padding: 10,
																	borderWidth: 0,
																	borderBottomWidth: 1,
																	borderBottomColor: Colors.lightBorder,
																	backgroundColor: Colors.white,
																}}
															>
																<Text
																	style={{
																		color: Colors.black,
																		fontFamily: "Roboto-Regular",
																		fontSize: 14,
																		fontWeight: "400",
																	}}
																>
																	{`${item.name}, ${item.country.name}`}
																</Text>
															</View>
														</TouchableHighlight>
													))}
												</View>
											);
										}}
									/>

									<Button
										title={LocalizedText.SUBMIT}
										style={{ marginTop: 30 }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</View>
							)}
						</Formik>
					</BottomSheet>

					<JourneyAirportList
						isVisible={this.state.isJourneyAirportListOpen}
						airports={this.state.airports}
						onAirportSelect={this.onAirportSelect}
						onClose={this.closeAirportList}
					/>

					<FilePickerModal
						ref={this.filepickermodal}
						onSelectImage={this.onSelectImage}
						onCaptureImage={this.onCaptureImage}
						onSelectDocument={this.onSelectDocument}
						onGotoMyDocuments={this.gotoMyDocuments}
					/>

					{/* <BottomSheet
						title={"Upload Document"}
						isVisible={this.state.isAddDocumentModalOpen}
						onClose={this.closeDocumentModal}
						style={{
							height: Math.floor(Constant.WINDOW_HEIGHT * 0.5),
						}}
					>
						<View style={{ flex: 1, width: "100%" }}>
							<View style={{ flexDirection: "row" }}>
								<Card style={styles.myDocumentUplaodBtn}>
									<>
										<FontAwesomeIcon
											icon={faFolderArrowUp}
											size={50}
											color={Colors.primaryBg}
											style={{ marginTop: 10 }}
										/>
										<Text style={styles.uploadBtnTxt}>
											{"Upload from My Documents"}
										</Text>
									</>
								</Card>
								<Card
									style={styles.myDeviceUploadBtn}
									// onPress={this.openAddAttachmentModal}
								>
									<>
										<FontAwesomeIcon
											icon={faUpload}
											size={50}
											color={Colors.primaryBg}
											style={{ marginTop: 10 }}
										/>
										<Text style={styles.uploadBtnTxt}>
											{"Upload from Device"}
										</Text>
									</>
								</Card>
							</View>
						</View>
					</BottomSheet> */}

					<OverlayLoader visible={this.state.isOverlayModalOpen} />
				</View>
			);
		}
	};
}

const styles = StyleSheet.create({
	tabComponent: {
		flex: 1,
		paddingHorizontal: 15,
	},
	locationWrapper: {
		paddingLeft: 20,
	},
	locationBox: {
		width: "100%",
		paddingTop: 5,
		minHeight: 80,
		borderLeftWidth: 1,
		borderLeftColor: Colors.secondaryBtn,
	},
	locationTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 25,
	},
	locationTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 20,
		color: Colors.primaryFont,
	},
	locationIndicator: {
		position: "absolute",
		left: 0,
		top: 0,
		height: 40,
		width: 40,
		borderRadius: 100,
		backgroundColor: Colors.secondaryBtn,
		alignItems: "center",
		justifyContent: "center",
	},
	activityBox: {
		width: Constant.WINDOW_WIDTH - 55,
		minHeight: 50,
		marginTop: 15,
		paddingLeft: 20,
		// paddingTop: 3,
		borderLeftWidth: 0,
	},
	activityIndicator: {
		height: 28,
		width: 28,
		borderRadius: 100,
		backgroundColor: Colors.secondaryAlpha2,
		alignItems: "center",
		justifyContent: "center",
	},
	activityName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		marginBottom: 3,
		opacity: 0.9,
	},
	activitiyDesc: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	docChipWrapper: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 5,
	},
	docChip: {
		// width: "auto",
		// flexDirection: "row",
		// alignItems: "center",
		// paddingVertical: 4,
		// paddingHorizontal: 10,
		// borderWidth: 1,
		// borderColor: Colors.lightBorder,
		// // borderRadius: 30,
		// borderRadius: 5,
		// marginRight: 5,
		// marginVertical: 5,
		width: "auto",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 8,
		marginRight: 6,
		marginVertical: 6,
		backgroundColor: Colors.white,
		elevation: 2, // Adds a subtle shadow for depth
	},
	docTitle: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 13,
		color: Colors.secondaryFont,
		// marginLeft: 5,
		opacity: 0.9,
	},
	attachmentBtn: {
		width: 110,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 3,
		paddingHorizontal: 5,
		// backgroundColor: '#edebeb',
		// borderWidth: 1,
		// borderStyle: "dashed",
		// borderColor: Colors.lightBorder,
		borderRadius: 30,
		marginTop: 10,
	},
	activityAddBtn: {
		marginLeft: -14,
		height: 28,
		width: 28,
		borderRadius: 100,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 10,
	},
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	activityModalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.6),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 10,
	},
	modalHeader: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 15,
		paddingHorizontal: 15,
	},
	modalCloseBtn: {
		position: "absolute",
		right: 8,
		padding: 5,
		borderRadius: 90,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	listActivityItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
	},
	listActivityAvatar: {
		height: 35,
		width: 35,
		borderRadius: 100,
		backgroundColor: Colors.secondaryAlpha1,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	fabBtn: {
		width: 50,
		height: 50,
		right: 25,
		bottom: 25,
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 100,
		backgroundColor: Colors.primaryBtn,
		...Platform.select({
			android: {
				elevation: 5,
			},
			ios: {
				shadowColor: Colors.shadowColor,
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 1,
				shadowRadius: 2,
			},
		}),
	},
	attachmentModalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.65),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	attachmentMOdalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	webviewModalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	webview: {
		flex: 1,
		width: Constant.WINDOW_WIDTH,
		backgroundColor: Colors.white,
	},
	docText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 13,
		color: Colors.primaryBtn,
		marginLeft: 3,
	},
	ph10: {
		// paddingHorizontal: 10,
		borderRadius: 5,
	},
	item: {
		flexDirection: "row",
		paddingVertical: 10,
		alignItems: "center",
	},
	w50: {
		width: 50,
	},
	itemText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	lightLabel: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 13,
		color: Colors.primaryFont,
	},
	addLocationBtn: {
		padding: 5,
		marginHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	myDocumentUplaodBtn: {
		padding: 15,
		borderRadius: 10,
		margin: 15,
		marginLeft: 18,
		width: Math.floor((Constant.WINDOW_WIDTH - 60) / 2),
		minHeight: 150,
		alignItems: "center",
	},
	myDeviceUploadBtn: {
		padding: 15,
		borderRadius: 10,
		margin: 15,
		width: Math.floor((Constant.WINDOW_WIDTH - 60) / 2),
		minHeight: 150,
		alignItems: "center",
	},
	uploadBtnTxt: {
		textAlign: "center",
		fontFamily: "Roboto-Regular",
		fontSize: 16,
		fontWeight: "400",
		color: Colors.lightFont,
		marginTop: 10,
	},
});
