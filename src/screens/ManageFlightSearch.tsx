import React, { useEffect, useRef, useState } from "react";
import {
	Alert,
	Keyboard,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
} from "react-native";
import moment from "moment-timezone";
// @ts-ignore
import Image from "react-native-remote-svg";
import { FlatList } from "react-native-gesture-handler";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleExclamation } from "@fortawesome/pro-regular-svg-icons/faCircleExclamation";
import { ManageFlightSearchScreenProps } from "../navigation/NavigationTypes";
import {
	AutoCompleteInput,
	Button,
	Container,
	Datepicker,
	Header,
	Loader,
	OverlayLoader,
	InputField,
	WhiteContainer,
} from "../components";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import { debounce } from "../utils/Util";
import { searchFlight, searchFlightName } from "../services/ApiService";
import TourBookService from "../services/TourBookService";
import FlightDataCard from "../components/FlightDataCard";
import CustomAlert from "../components/CustomAlert";

type FormModel = {
	airlineName: string;
	airlineCode: string;
	flightNumber: string;
	date: string;
};

const validationSchema = Yup.object().shape({
	airlineCode: Yup.string().required("Airline Code is required"),
	date: Yup.string().required("Select a date"),
	flightNumber: Yup.string().required("Flight Number is required"),
});

const ManageFlightSearch: React.FC<ManageFlightSearchScreenProps> = (
	props: ManageFlightSearchScreenProps
): React.ReactElement => {
	const formikRef = useRef<FormikProps<FormModel>>(null);
	const [originFlights, setOriginFLights] = useState<Array<any>>([]);
	const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);
	const [isFlightResultHide, setIsFlightResultHide] = useState<boolean>(true);
	const [date, setDate] = useState<null | string>(null);
	const [flightData, setFlightData] = useState<Array<any>>([]);
	const [flightIataData, setFlightIataData] = useState<null | any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [airlineName, setAirlineName] = useState<string>("");
	const [airportCitiesData, setAirportCitiesData] = useState<Array<any>>([]);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
	const [alertMessageParts, setAlertMessageParts] = useState<Array<any>>([]);

	useEffect(() => {
		const { route } = props;
		if (typeof route.params.activityId !== "undefined") {
			setDate(route.params.date as string);
			formikRef &&
				formikRef.current?.setFieldValue(
					"airlineName",
					route.params.flightCode
				);
			formikRef.current?.setFieldValue("airlineCode", route.params.flightCode);
			formikRef &&
				formikRef.current?.setFieldValue("flightNumber", route.params.flightNo);
			formikRef && formikRef.current?.setFieldValue("date", route.params.date);
		}
	}, []);

	const onChangeFlight = (value: string) => {
		let trimValue: string = value.trim();

		formikRef && formikRef.current?.setFieldValue("airlineName", value);

		if (trimValue.length > 1) {
			const searchMethod = debounce(() => {
				setIsSearchingFlights(true);
				searchFlightName(value)
					.then((response) => {
						setOriginFLights(response.data);
						setIsFlightResultHide(false);
						setIsSearchingFlights(false);
					})
					.catch((error) => {
						setIsSearchingFlights(false);
					});
			});
			searchMethod();
		} else {
			setOriginFLights([]);
			setIsSearchingFlights(false);
			setIsFlightResultHide(true);
		}
	};

	const onSelectFlight = (item: any) => {
		setIsFlightResultHide(true);
		formikRef && formikRef.current?.setFieldValue("airlineName", item.iata);
		formikRef && formikRef.current?.setFieldValue("airlineCode", item.iata);
	};

	const onClearFlight = () => {
		Keyboard.dismiss();
		setIsFlightResultHide(true);
		formikRef && formikRef.current?.setFieldValue("airlineName", "");
		formikRef && formikRef.current?.setFieldValue("airlineCode", "");
	};

	const setFlightDate = (value: string) => {
		setDate(value);
		formikRef && formikRef.current?.setFieldValue("date", value);
	};

	const renderItem = ({ item }: any) => (
		<TouchableHighlight
			key={item._id}
			activeOpacity={0.5}
			underlayColor={Colors.rippleColor}
			onPress={() => onSelectFlight(item)}
		>
			<View style={styles.listItem}>
				<Text style={styles.airportIataCode}>{item.iata}</Text>
				<Text style={styles.airportName}>{`${item.airlineName}`}</Text>
			</View>
		</TouchableHighlight>
	);

	const keyExtractor = (item: any) => item._id;

	const renderResultList = (listProps: any) => (
		<View
			style={{
				height: "auto",
				maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.35),
				backgroundColor: Colors.white,
			}}
		>
			<FlatList
				data={listProps.data}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				showsVerticalScrollIndicator={true}
				keyboardShouldPersistTaps="handled"
				persistentScrollbar={true}
			/>
		</View>
	);

	const onSearch = (values: FormModel) => {
		setFlightData([]);
		Keyboard.dismiss();
		let reqData = {
			airlineCode: values.airlineCode,
			flightNumber: values.flightNumber,
			date: moment(values.date).format("YYYY-MM-DD"),
		};

		setIsLoading(true);
		searchFlight(reqData)
			.then((response) => {
				if (response.check === true) {
					const data: Array<any> = response.data.flightStatuses;
					const findAirlineName = response.data.appendix.airlines.find(
						(item: any) => item.iata === values.airlineCode
					);
					const equpimentArr: Array<any> =
						typeof response.data.appendix !== "undefined"
							? response.data.appendix.equipments
							: [];
					const equipmentData = equpimentArr.filter((elem: any) => {
						for (let index = 0; index < data.length; index++) {
							const element = data[index];
							if (
								typeof element?.flightEquipment?.actualEquipmentIataCode !==
								"undefined"
							) {
								if (
									elem.iata ===
									element?.flightEquipment?.actualEquipmentIataCode
								) {
									return true;
								}
								break;
							} else if (
								typeof element?.flightEquipment?.scheduledEquipmentIataCode !==
								"undefined"
							) {
								if (
									elem.iata ===
									element?.flightEquipment?.scheduledEquipmentIataCode
								) {
									return true;
								}
								break;
							}
						}
					});
					const airports: Array<any> =
						typeof response.data.appendix !== "undefined"
							? response.data.appendix.airports
							: [];
					setFlightData(data);
					setAirlineName(findAirlineName.name);
					setFlightIataData(equipmentData[0]);
					setAirportCitiesData(airports);
					setIsLoading(false);
				} else {
					const messageParts: Array<any> = [{ text: response.message }];
					setIsLoading(false);
					setAlertMessageParts(messageParts);
					setIsAlertVisible(true);
				}
			})
			.catch((error) => {
				setAirlineName("");
				setFlightIataData(null);
				setAirportCitiesData([]);
				setIsLoading(false);
			});
	};

	const onAddtoTourbook = (
		item: any,
		departureCity: string,
		arrivalCity: string
	) => {
		let reqData = {
			journey_id: props.route.params.journeyId,
			activity_name: props.route.params.activityName,
			activity_slug: props.route.params.activitySlug,
			origin: item.departureAirportFsCode,
			destination: item.arrivalAirportFsCode,
			departureDate: moment(item.departureDate.dateLocal).format("YYYY-MM-DD"),
			departureTime: moment(item.departureDate.dateLocal).format("HH:mm:ss"),
			arrivalTime: moment(item.arrivalDate.dateLocal).format("HH:mm:ss"),
			airlineName: airlineName,
			flightNo: item.flightNumber,
			flightCode: item.carrierFsCode,
			flightStatus: item.status,
			departureTerminal:
				typeof item.airportResources.departureTerminal !== "undefined"
					? item.airportResources.departureTerminal
					: null,
			arrivalTerminal:
				typeof item.airportResources.arrivalTerminal !== "undefined"
					? item.airportResources.arrivalTerminal
					: null,
			departureGate:
				typeof item.airportResources.departureGate !== "undefined"
					? item.airportResources.departureGate
					: null,
			arrivalGate:
				typeof item.airportResources.arrivalGate !== "undefined"
					? item.airportResources.arrivalGate
					: null,
			arrivalCity: arrivalCity,
			departureCity: departureCity,
			flightDuration: item.flightDurations.scheduledBlockMinutes.toString(),
			equipmentName: flightIataData.name,
		};

		setIsSubmitting(true);
		TourBookService.addActivity(reqData)
			.then((response) => {
				setIsSubmitting(false);
				props.navigation.pop(1);
			})
			.catch((error) => {
				setIsSubmitting(false);
			});
	};

	const goToAirportInfo = () => {};

	const renderScheduledFlightItem = ({ item }: any) => {
		let departureCity = airportCitiesData.find(
			(elem: any) => elem.iata === item.departureAirportFsCode
		);
		let arrivalCity = airportCitiesData.find(
			(elem: any) => elem.iata === item.arrivalAirportFsCode
		);

		return (
			<FlightDataCard
				flightData={item}
				departureCity={departureCity.city}
				arrivalCity={arrivalCity.city}
				flightDuration={item.flightDurations.scheduledBlockMinutes.toString()}
				flightIataData={flightIataData.name}
				onAddtoTourbook={onAddtoTourbook}
				style={{ marginVertical: 7 }}
			/>
		);
	};

	const keyScheduledFlightExtractor = (item: any) => item.flightId;

	const currentDate: any = moment(new Date());
	const futureDate: any = currentDate.add(3, "days");

	return (
		<Container>
			<Header title="Search your Flight" />
			<WhiteContainer style={{ paddingHorizontal: 0 }}>
				<Formik
					innerRef={formikRef}
					initialValues={{
						airlineCode: "",
						airlineName: "",
						flightNumber: "",
						date: "",
					}}
					validationSchema={validationSchema}
					onSubmit={onSearch}
				>
					{({
						handleChange,
						handleSubmit,
						handleBlur,
						touched,
						errors,
						values,
					}) => (
						<View
							style={{
								flex: 0.8,
								width: Constant.WINDOW_WIDTH - 30,
								marginHorizontal: 15,
								zIndex: 1,
								marginBottom: 20,
							}}
						>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									// borderWidth: 1,
								}}
							>
								<View style={{ flex: 1, marginRight: 5 }}>
									<AutoCompleteInput
										label="Flight Code"
										value={values.airlineName}
										data={originFlights}
										onChangeText={onChangeFlight}
										onClear={onClearFlight}
										isSearching={isSearchingFlights}
										hideResults={isFlightResultHide}
										error={
											touched.airlineCode && errors.airlineCode
												? errors.airlineCode
												: null
										}
										containerStyle={{ zIndex: 9 }}
										renderResultList={renderResultList}
									/>
								</View>
								<View style={{ flex: 1, marginLeft: 5 }}>
									<InputField
										label={"Flight Number"}
										value={values.flightNumber}
										autoCapitalize="characters"
										onChangeText={handleChange("flightNumber")}
										onBlur={handleBlur("flightNumber")}
										error={
											touched.flightNumber && errors.flightNumber
												? errors.flightNumber
												: null
										}
										style={{ marginBottom: 0 }}
										// inputContainerStyle={{ marginTop: 10 }}
									/>
								</View>
							</View>

							<Datepicker
								label={"Date"}
								value={date}
								style={{ marginTop: 15 }}
								minimumDate={moment().format("YYYY-MM-DD")}
								onDateChange={setFlightDate}
								hasError={(touched.date && errors.date) as boolean}
							/>
							{touched.date && errors.date ? (
								<Text style={styles.errorText}>{errors.date}</Text>
							) : null}

							<Button
								title="Search"
								style={{ marginTop: 25 }}
								onPress={() => handleSubmit()}
							/>
						</View>
					)}
				</Formik>
				<View style={styles.flightAlertBox}>
					<View style={{ width: 30, alignItems: "flex-start" }}>
						<FontAwesomeIcon
							icon={faCircleExclamation}
							size={20}
							color={Colors.primary}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.flightAlertText}>
							{`Search results are limited to dates on or before ${moment(
								futureDate
							).format("D MMMM, YYYY")}.`}
						</Text>
					</View>
				</View>
				<CustomAlert
					isVisible={isAlertVisible}
					title={"Sorry"}
					messageParts={alertMessageParts}
					canceBtnstyle={styles.cancelBtnStyle}
					onCancel={() => setIsAlertVisible(false)}
				/>
				<View
					style={{
						flex: 2,
						marginHorizontal: 15,
					}}
				>
					{isLoading ? (
						<Loader />
					) : (
						<>
							{flightData.length > 0 && (
								<>
									<FlatList
										data={flightData}
										renderItem={renderScheduledFlightItem}
										keyExtractor={keyScheduledFlightExtractor}
										showsVerticalScrollIndicator={false}
										keyboardShouldPersistTaps="handled"
										persistentScrollbar={true}
									/>
								</>
							)}
						</>
					)}
				</View>
			</WhiteContainer>

			<OverlayLoader visible={isSubmitting} />
		</Container>
	);
};

export default ManageFlightSearch;

const styles = StyleSheet.create({
	listItem: {
		padding: 10,
		borderWidth: 0,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		backgroundColor: Colors.white,
	},
	airportListContainer: {
		height: "auto",
		maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.55),
	},
	airportName: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		fontWeight: "400",
		opacity: 0.9,
	},
	airportIataCode: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontSize: 14,
		fontWeight: "500",
		opacity: 0.9,
	},
	itemContainer: {
		paddingVertical: 15,
		paddingHorizontal: 12,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 34,
		marginVertical: 7,
	},
	flightCodeTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.secondaryFont,
		textAlign: "right",
	},
	cityToCityTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
	},
	airportCodeTxt: {
		fontFamily: "Roboto-Rehular",
		fontWeight: "400",
		fontSize: 18,
		color: Colors.primaryBg,
	},
	flightTimeTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
	},
	flightNameTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 13,
		color: Colors.secondaryFont,
		textAlign: "right",
	},
	flightDateTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.secondaryFont,
	},
	terminalValueTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.secondaryFont,
		marginLeft: 2,
	},
	addtoTourbookBtn: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	addtoTourbookBtnTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
		color: Colors.primaryBtn,
		lineHeight: 18,
	},
	errorText: {
		fontSize: 11,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.danger,
		marginTop: 3,
	},
	flightDurationtxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.secondaryFont,
	},
	statusBox: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 25,
		alignItems: "center",
		height: 30,
		width: "auto",
		minWidth: 50,
		paddingHorizontal: 6,
		paddingRight: 10,
	},
	statusText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
		color: Colors.primaryFont,
		opacity: 0.6,
	},
	statusIconBackground: {
		justifyContent: "center",
		alignItems: "center",
		width: 20,
		height: 20,
		borderRadius: 50,
		marginRight: 5,
	},
	aiportInfoButton: {
		width: 15,
		height: 15,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.lightBorder,
		marginLeft: 4,
	},
	flightAlertBox: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		flexDirection: "row",
		margin: 15,
		marginTop: 15,
		padding: 10,
		backgroundColor: Colors.secondaryAlpha2,
		borderRadius: 5,
	},
	flightAlertText: {
		fontSize: 12,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		lineHeight: 18,
	},
	cancelBtnStyle: {
		width: 100,
		padding: 10,
		marginHorizontal: 5,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: Colors.primaryBg,
	},
});
