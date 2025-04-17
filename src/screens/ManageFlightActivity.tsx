import React from "react";
import {
	Keyboard,
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import moment from "moment-timezone";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	Datepicker,
	TimePicker,
	OverlayLoader,
	AutoCompleteInput,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { FlightActivityScreenProps } from "../navigation/NavigationTypes";
import TourBookService from "../services/TourBookService";
import { debounce, isEmptyString } from "../utils/Util";
import { searchAirport } from "../services/ApiService";
import AppContext from "../context/AppContext";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	originIATA: Yup.string().required("Select origin airport name"),
	destinationIATA: Yup.string()
		.required("Select destination airport name")
		.when("originIATA", ([originIATA], schema) => {
			return schema.test({
				name: "compareIATA",
				message: "Origin and destination should not be same",
				test: (value) => originIATA !== value,
			});
		}),
	departureDate: Yup.string().required("Select a flight date"),
	departureTime: Yup.string().required("Select a departure time"),
	airlineName: Yup.string().min(5, "Minimum length is 5"),
	flightNo: Yup.string().min(3, "Minimum length is 3"),
});

type FormModel = {
	originName: string;
	originIATA: string;
	destinationName: string;
	destinationIATA: string;
	departureDate: string;
	departureTime: string;
	arrivalTime: string;
	airlineName: string;
	flightNo: string;
};

type States = {
	journeyId: string;
	cityId: string;
	cityName: string;
	activityName: string;
	activitySlug: string;
	activityId: undefined | string;
	origin: undefined | { _id: string; name: string; iataCode: string };
	destination: undefined | { _id: string; name: string; iataCode: string };
	departureDate: null | string;
	departureTime: null | Date;
	arrivalTime: null | Date;
	originAirports: Array<any>;
	destinationAirports: Array<any>;
	isSerachingOrigin: boolean;
	isSearchingDestination: boolean;
	isOriginResultHide: boolean;
	isDestinationResultHide: boolean;
	isSubmitting: boolean;
};

export default class ManageFlightActivity extends React.Component<
	FlightActivityScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: FlightActivityScreenProps) {
		super(props);
		const { route } = this.props;
		this.state = {
			journeyId: route.params.journeyId,
			cityId: route.params.cityId,
			cityName: route.params.cityName,
			activityName: route.params.activityName,
			activitySlug: route.params.activitySlug,
			activityId: undefined,
			origin: undefined,
			destination: undefined,
			departureDate: null,
			departureTime: null,
			arrivalTime: null,
			originAirports: [],
			destinationAirports: [],
			isSerachingOrigin: false,
			isSearchingDestination: false,
			isOriginResultHide: true,
			isDestinationResultHide: true,
			isSubmitting: false,
		};
		this.formikRef = React.createRef();
	}

	componentDidMount = (): void => {
		const { route } = this.props;
		if (typeof route.params.activityId !== "undefined") {
			this.setState(
				{
					activityId: route.params.activityId,
					origin: route.params.origin,
					destination: route.params.destination,
					departureDate: route.params.departureDate as string,
					departureTime: new Date(
						`${moment().format("YYYY-MM-DD")} ${route.params.departureTime}`
					),
					arrivalTime:
						typeof route.params.arrivalTime !== "undefined"
							? new Date(
									`${moment().format("YYYY-MM-DD")} ${route.params.arrivalTime}`
							  )
							: null,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"originName",
							route.params.origin?.name
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"originIATA",
							route.params.origin?.iataCode
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"destinationName",
							route.params.destination?.name
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"destinationIATA",
							route.params.destination?.iataCode
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"departureDate",
							route.params.departureDate
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"departureTime",
							route.params.departureTime
						);
					this.formikRef.current?.setFieldValue(
						"arrivalTime",
						typeof route.params.arrivalTime !== "undefined"
							? route.params.arrivalTime
							: ""
					);
					this.formikRef.current?.setFieldValue(
						"airlineName",
						typeof route.params.airlineName !== "undefined"
							? route.params.airlineName
							: ""
					);
					this.formikRef.current?.setFieldValue(
						"flightNo",
						typeof route.params.flightNo !== "undefined"
							? route.params.flightNo
							: ""
					);
				}
			);
		}
	};

	onChangeOrigin = (value: string) => {
		let trimValue: string = value.trim();
		this.formikRef &&
			this.formikRef.current?.setFieldValue("originName", value);

		if (trimValue.length > 2) {
			const searchMethod = debounce(() => {
				this.setState({ isSerachingOrigin: true }, () => {
					searchAirport(value)
						.then((response: any[]) => {
							this.setState({
								originAirports: response,
								isOriginResultHide: false,
								isSerachingOrigin: false,
							});
						})
						.catch((error: any) => {
							this.setState({ isSerachingOrigin: false });
						});
				});
			});

			searchMethod();
		} else {
			this.setState({
				isSerachingOrigin: false,
				isOriginResultHide: true,
				originAirports: [],
			});
		}
	};

	onChangeDestination = (value: string) => {
		let trimValue: string = value.trim();
		this.formikRef &&
			this.formikRef.current?.setFieldValue("destinationName", value);

		if (trimValue.length > 2) {
			const searchMethod = debounce(() => {
				this.setState({ isSearchingDestination: true }, () => {
					searchAirport(value)
						.then((response: any[]) => {
							this.setState({
								destinationAirports: response,
								isDestinationResultHide: false,
								isSearchingDestination: false,
							});
						})
						.catch((error: any) => {
							this.setState({ isSearchingDestination: false });
						});
				});
			});

			searchMethod();
		} else {
			this.setState({
				isSearchingDestination: false,
				isDestinationResultHide: true,
				destinationAirports: [],
			});
		}
	};

	onClearOrigin = () => {
		Keyboard.dismiss();
		this.setState({ isOriginResultHide: true }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("originName", "");
		});
	};

	onClearDestination = () => {
		Keyboard.dismiss();
		this.setState({ isDestinationResultHide: true }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("destinationName", "");
		});
	};

	onSelectOriginItem = (item: any) => {
		Keyboard.dismiss();
		this.setState(
			{
				isOriginResultHide: true,
				origin: {
					_id: item._id,
					name: item.name,
					iataCode: item.iata_code,
				},
			},
			() => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue("originName", item.name);
				this.formikRef &&
					this.formikRef.current?.setFieldValue("originIATA", item.iata_code);
			}
		);
	};

	onSelectDestinationItem = (item: any) => {
		Keyboard.dismiss();
		this.setState(
			{
				isDestinationResultHide: true,
				destination: {
					_id: item._id,
					name: item.name,
					iataCode: item.iata_code,
				},
			},
			() => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue("destinationName", item.name);
				this.formikRef &&
					this.formikRef.current?.setFieldValue(
						"destinationIATA",
						item.iata_code
					);
			}
		);
	};

	setDepartureDate = (value: string) => {
		this.setState({ departureDate: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("departureDate", value);
		});
	};

	setDepartureTime = (value: Date) => {
		this.setState({ departureTime: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"departureTime",
					moment(value).format("HH:mm:ss")
				);
		});
	};

	setArrivalTime = (value: Date) => {
		this.setState({ arrivalTime: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"arrivalTime",
					moment(value).format("HH:mm:ss")
				);
		});
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: FormModel) => {
		this.setState({ isSubmitting: true }, () => {
			if (typeof this.state.activityId === "undefined") {
				const reqData: any = {
					journey_id: this.state.journeyId,
					city_id: this.state.cityId,
					city_name: this.state.cityName,
					activity_name: this.state.activityName,
					activity_slug: this.state.activitySlug,
					origin: this.state.origin,
					destination: this.state.destination,
					departureDate: values.departureDate,
					departureTime: values.departureTime,
				};

				if (!isEmptyString(values.arrivalTime)) {
					reqData.arrivalTime = values.arrivalTime;
				}
				if (!isEmptyString(values.airlineName)) {
					reqData.airlineName = values.airlineName;
				}
				if (!isEmptyString(values.flightNo)) {
					reqData.flightNo = values.flightNo;
				}

				TourBookService.addActivity(reqData)
					.then((response) => {
						this.setState({ isSubmitting: false }, () => {
							this.props.navigation.pop(1);
						});
					})
					.catch((error) => {
						this.setState({ isSubmitting: false });
					});
			} else {
				const reqData: any = {
					journey_Id: this.state.journeyId,
					activity_id: this.state.activityId,
					activity_slug: this.state.activitySlug,
					origin: this.state.origin,
					destination: this.state.destination,
					departureDate: values.departureDate,
					departureTime: values.departureTime,
				};

				if (!isEmptyString(values.arrivalTime)) {
					reqData.arrivalTime = values.arrivalTime;
				}
				if (!isEmptyString(values.airlineName)) {
					reqData.airlineName = values.airlineName;
				}
				if (!isEmptyString(values.flightNo)) {
					reqData.flightNo = values.flightNo;
				}

				TourBookService.editActivity(reqData)
					.then((response) => {
						this.setState({ isSubmitting: false }, () => {
							this.props.navigation.pop(1);
						});
					})
					.catch((error) => {
						this.setState({ isSubmitting: false });
					});
			}
		});
	};

	render = () => {
		return (
			<Container>
				<Header
					title={
						typeof this.props.route.params.activityId !== "undefined"
							? LocalizedText.EDIT_FLIGHT
							: LocalizedText.ADD_FLIGHT
					}
				/>
				<WhiteContainer style={{ paddingHorizontal: 0 }}>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{
								originName: "",
								originIATA: "",
								destinationName: "",
								destinationIATA: "",
								departureDate: "",
								departureTime: "",
								arrivalTime: "",
								airlineName: "",
								flightNo: "",
							}}
							validationSchema={validationSchema}
							onSubmit={this.onSubmit}
							innerRef={this.formikRef}
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
										flex: 1,
										width: Constant.WINDOW_WIDTH - 30,
										marginHorizontal: 15,
										zIndex: 1,
									}}
								>
									<View style={{ marginBottom: 10 }}>
										<AutoCompleteInput
											label={LocalizedText.FLIGHT_ORIGIN}
											value={values.originName}
											data={this.state.originAirports}
											onChangeText={this.onChangeOrigin}
											onClear={this.onClearOrigin}
											isSearching={this.state.isSerachingOrigin}
											hideResults={this.state.isOriginResultHide}
											error={
												touched.originIATA && errors.originIATA
													? errors.originIATA
													: null
											}
											containerStyle={{ zIndex: 9 }}
											renderResultList={(listProps: any) => {
												const data: any[] = listProps.data;
												return (
													<View style={styles.airportListContainer}>
														<ScrollView keyboardShouldPersistTaps="handled">
															{data.map((item: any, index: number) => (
																<TouchableHighlight
																	key={item.id}
																	activeOpacity={0.5}
																	underlayColor={Colors.rippleColor}
																	onPress={this.onSelectOriginItem.bind(
																		this,
																		item
																	)}
																>
																	<View style={styles.listItem}>
																		<Text style={styles.airportName}>
																			{item.name}
																			<Text style={styles.airportIataCode}>
																				{` (${item.iata_code})`}
																			</Text>
																		</Text>
																		<Text style={styles.airportCity}>
																			{`${item.city.name}, ${item.country.name}`}
																		</Text>
																	</View>
																</TouchableHighlight>
															))}
														</ScrollView>
													</View>
												);
											}}
										/>
									</View>

									<View style={{ marginBottom: 10 }}>
										<AutoCompleteInput
											label={LocalizedText.FLIGHT_DESTINATION}
											value={values.destinationName}
											data={this.state.destinationAirports}
											onChangeText={this.onChangeDestination}
											onClear={this.onClearDestination}
											isSearching={this.state.isSearchingDestination}
											hideResults={this.state.isDestinationResultHide}
											error={
												touched.destinationIATA && errors.destinationIATA
													? errors.destinationIATA
													: null
											}
											renderResultList={(listProps: any) => {
												const data: any[] = listProps.data;
												return (
													<View style={styles.airportListContainer}>
														<ScrollView keyboardShouldPersistTaps="handled">
															{data.map((item: any, index: number) => (
																<TouchableHighlight
																	key={item.id}
																	activeOpacity={0.5}
																	underlayColor={Colors.rippleColor}
																	onPress={this.onSelectDestinationItem.bind(
																		this,
																		item
																	)}
																>
																	<View style={styles.listItem}>
																		<Text style={styles.airportName}>
																			{item.name}
																			<Text style={styles.airportIataCode}>
																				{` (${item.iata_code})`}
																			</Text>
																		</Text>
																		<Text style={styles.airportCity}>
																			{`${item.city.name}, ${item.country.name}`}
																		</Text>
																	</View>
																</TouchableHighlight>
															))}
														</ScrollView>
													</View>
												);
											}}
										/>
									</View>
									<Datepicker
										label={LocalizedText.FLIGHT_DEPARTURE_DATE}
										value={this.state.departureDate}
										style={{ marginTop: 10 }}
										minimumDate={moment().format("YYYY-MM-DD")}
										onDateChange={this.setDepartureDate}
										hasError={
											(touched.departureDate && errors.departureDate) as boolean
										}
									/>
									{touched.departureDate && errors.departureDate ? (
										<Text style={styles.errorText}>{errors.departureDate}</Text>
									) : null}

									<TimePicker
										label={LocalizedText.FLIGHT_DEPARTURE_TIME}
										value={this.state.departureTime}
										style={{ marginTop: 15 }}
										onTimeChange={this.setDepartureTime}
										hasError={
											(touched.departureTime && errors.departureTime) as boolean
										}
									/>
									{touched.departureTime && errors.departureTime ? (
										<Text style={styles.errorText}>{errors.departureTime}</Text>
									) : null}

									<TimePicker
										label={LocalizedText.FLIGHT_ARRIVAL_TIME}
										value={this.state.arrivalTime}
										style={{ marginTop: 15 }}
										onTimeChange={this.setArrivalTime}
										hasError={
											(touched.arrivalTime && errors.arrivalTime) as boolean
										}
									/>
									{touched.arrivalTime && errors.arrivalTime ? (
										<Text style={styles.errorText}>{errors.arrivalTime}</Text>
									) : null}

									<View style={{ marginTop: 15 }}>
										<InputField
											label={LocalizedText.FLIGHT_AIRLINE_NAME}
											value={values.airlineName}
											autoCapitalize="words"
											onChangeText={handleChange("airlineName")}
											onBlur={handleBlur("airlineName")}
											error={
												touched.airlineName && errors.airlineName
													? errors.airlineName
													: null
											}
										/>
									</View>

									<InputField
										label={LocalizedText.FLIGHT_NUMBER}
										value={values.flightNo}
										autoCapitalize="characters"
										onChangeText={handleChange("flightNo")}
										onBlur={handleBlur("flightNo")}
										error={
											touched.flightNo && errors.flightNo
												? errors.flightNo
												: null
										}
									/>

									<Button
										title={
											typeof this.props.route.params.activityId === "undefined"
												? LocalizedText.SUBMIT
												: LocalizedText.UPDATE
										}
										style={{ marginTop: 30 }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</View>
							)}
						</Formik>
					</ScrollView>
				</WhiteContainer>
				<OverlayLoader visible={this.state.isSubmitting} />
			</Container>
		);
	};
}

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
		maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.45),
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
	airportCity: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 12,
		fontWeight: "400",
		marginTop: 3,
		opacity: 0.8,
	},
	label: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		lineHeight: 20,
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 0.9,
		marginTop: 15,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
});
