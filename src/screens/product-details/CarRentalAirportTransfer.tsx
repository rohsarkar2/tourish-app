import React, { useEffect, useState, useRef, useContext } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	View,
	Alert,
	TouchableOpacity,
} from "react-native";
import { CarRentalAirportTransferScreenProps } from "../../navigation/NavigationTypes";
import Colors from "../../configs/Colors";
import {
	Button,
	Datepicker,
	Header,
	Loader,
	TimePicker,
	Container,
	WhiteContainer,
	OverlayLoader,
	Accordion,
	BottomSheet,
} from "../../components";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons/faLocationDot";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import { faLanguage } from "@fortawesome/pro-light-svg-icons/faLanguage";
import { faClipboardCheck } from "@fortawesome/pro-light-svg-icons/faClipboardCheck";
import { faArrowRotateLeft } from "@fortawesome/pro-light-svg-icons/faArrowRotateLeft";
import { faSquare } from "@fortawesome/pro-solid-svg-icons/faSquare";
import { faPersonSeat } from "@fortawesome/pro-light-svg-icons/faPersonSeat";
import { faCircleInfo } from "@fortawesome/pro-regular-svg-icons/faCircleInfo";
import { faSuitcaseRolling } from "@fortawesome/pro-light-svg-icons/faSuitcaseRolling";
import { faCalendarClock } from "@fortawesome/pro-light-svg-icons/faCalendarClock";
import { faClockRotateLeft } from "@fortawesome/pro-light-svg-icons/faClockRotateLeft";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import moment from "moment-timezone";
import LocalizedText from "../../resources/LocalizedText";
import BookingStatus from "../../configs/BookingStatus";
import ProductService from "../../services/ProductService";
import BookingService from "../../services/BookingService";
import BookingSuccessModal from "../../components/BookingSuccessModal";
import AppContext from "../../context/AppContext";
import Constant from "../../configs/Constant";

const validationSchema = Yup.object().shape({
	date: Yup.string().required("Select a date"),
	time: Yup.string().required("Select start time"),
});

type FormModel = {
	date: string;
	time: string;
};

const Li: React.FC<{ text: string }> = (props) => {
	return (
		<View style={{ flexDirection: "row", marginBottom: 3 }}>
			<FontAwesomeIcon
				icon={faSquare}
				size={8}
				color={Colors.mediumGrey}
				style={{ marginTop: 3, marginRight: 8 }}
			/>
			<Text style={styles.smallText}>{props.text}</Text>
		</View>
	);
};

const CarRentalAirportTransfer: React.FC<
	CarRentalAirportTransferScreenProps
> = (props: CarRentalAirportTransferScreenProps): React.ReactElement => {
	const context = useContext(AppContext);
	const formikRef = useRef<FormikProps<FormModel>>(null);
	const bookingSuccessModalRef: any = useRef(null);

	const [date, setDate] = useState<null | string>(null);
	const [time, setTime] = useState<null | Date>(null);
	const [productDetails, setProductDetails] = useState<null | any>(null);
	const [localDateTime, setLocalDateTime] = useState<null | string>(null);
	const [reversedCancellationCharges, setReversedCancellationCharges] =
		useState<Array<any>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isOverlayModalOpen, setOverlayModal] = useState<boolean>(false);
	const [bookingErrorMsg, setBookingErrorMsg] = useState<null | string>(null);
	const [isRefundableModalOpen, setIsRefundableModalOpen] =
		useState<boolean>(false);

	useEffect(() => {
		const productId = props.route.params.productId;
		const currencyCode: string = context.userData?.currency.code as string;
		ProductService.getDetails(productId, currencyCode)
			.then((response) => {
				const resData: any = response.data;
				setLocalDateTime(
					moment().tz(resData.timeZone).format("DD/MM/YYYY, HH:mm:ss")
				);
				setProductDetails(resData);
				setReversedCancellationCharges(
					resData.othersCancellationCharges.reverse()
				);
				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
			});
	}, []);

	useEffect(() => {
		if (productDetails !== null) {
			const interVal = setInterval(() => {
				setLocalDateTime(
					moment().tz(productDetails.timeZone).format("DD/MM/YYYY, HH:mm:ss")
				);
			}, 1000);

			return () => {
				clearInterval(interVal);
			};
		}
	}, [productDetails, localDateTime]);

	const setBookingDate = (value: string) => {
		setDate(value);
		formikRef.current?.setFieldValue("date", value);
	};

	const setBookingTime = (value: Date) => {
		setTime(value);
		formikRef.current?.setFieldValue("time", moment(value).format("HH:mm:ss"));
	};

	const onBookingSubmit = (values: FormModel) => {
		setBookingErrorMsg(null);
		const localDate: string = moment()
			.tz(productDetails.timeZone)
			.format("YYYY-MM-DD");
		const localTime: string = moment()
			.tz(productDetails.timeZone)
			.format("HH:mm");

		const localDateTimeWithBuffer = moment(`${localDate} ${localTime}`)
			.add(Number(productDetails.minBookingHour), "hours")
			.format("YYYY-MM-DD HH:mm");

		const preferredDateTime = moment(`${values.date} ${values.time}`).format(
			"YYYY-MM-DD HH:mm"
		);

		let isProceed: boolean = false;

		// if (
		// 	moment(values.date, "YYYY-MM-DD").isBefore(
		// 		moment(localDate, "YYYY-MM-DD")
		// 	)
		// ) {
		// 	setBookingErrorMsg(
		// 		"** Prefered date should be greater than from local date"
		// 	);
		// 	return;
		// } else if (
		// 	moment(values.date, "YYYY-MM-DD").isSame(moment(localDate, "YYYY-MM-DD"))
		// ) {
		// 	const selectedTime: string = moment(
		// 		`${localDate} ${values.time}`,
		// 		"YYYY-MM-DD HH:mm:ss"
		// 	).format("HH:mm");
		// 	if (
		// 		moment(`${localDate} ${selectedTime}`, "YYYY-MM-DD HH:mm").isAfter(
		// 			moment(`${localDate} ${localTime}`, "YYYY-MM-DD HH:mm")
		// 		)
		// 	) {
		// 		isProceed = true;

		// 	} else {
		// 		isProceed = false;
		// 		setBookingErrorMsg(
		// 			"** Prefered time should be greater than from local time"
		// 		);
		// 	}
		// } else {
		// 	isProceed = true;
		// }

		if (
			moment(`${preferredDateTime}`, "YYYY-MM-DD HH:mm").isAfter(
				moment(`${localDateTimeWithBuffer}`, "YYYY-MM-DD HH:mm")
			)
		) {
			isProceed = true;
		} else {
			isProceed = false;
			setBookingErrorMsg(
				`** Next Booking is after ${productDetails.minBookingHour} hours from the local time`
			);
		}

		if (isProceed) {
			const { userData } = context;
			if (userData !== null) {
				const reqData: any = {
					customerId: context.userData?._id,
					productId: props.route.params.productId,
					date: values.date,
					time: values.time,
					toCurrency: userData.currency.code,
				};

				setOverlayModal(true);
				BookingService.addBooking(reqData)
					.then((response: any) => {
						setOverlayModal(false);
						if (response.check === true) {
							const data: any = response.data;
							if (data.status === BookingStatus.ACCEPTED) {
								props.navigation.navigate("Payment", {
									productId: props.route.params.productId,
									orderAmount: productDetails.price.value,
									currency: productDetails.price.code,
									bookingId: data._id,
									bookingNo: data.bookingNumber,
								});
							} else {
								setTimeout(() => {
									bookingSuccessModalRef &&
										bookingSuccessModalRef.current?.open(
											"Request Generated",
											response.message,
											data.bookingNumber,
											moment
												.utc(data.bookingDateTime)
												.format("DD/MM/YYYY HH:mm")
										);
								}, 300);
							}
						} else {
							Alert.alert("Sorry", response.message);
						}
					})
					.catch((error) => {
						setOverlayModal(false);
					});
			} else {
				Alert.alert(
					LocalizedText.SIGN_IN_TO_CONTINUE,
					LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
					[
						{ text: LocalizedText.CLOSE, style: "cancel" },
						{
							text: LocalizedText.SIGN_IN,
							onPress: () => {
								props.navigation.navigate("SignIn");
							},
						},
					]
				);
			}
		}
	};

	const getLanguageString = (languages: Array<any>): string => {
		const names: Array<string> = languages.map((item: any) => item.name);
		return names.join(", ");
	};

	const openRefundableModal = () => {
		setIsRefundableModalOpen(true);
	};

	const closeRefundableModal = () => {
		setIsRefundableModalOpen(false);
	};

	return (
		<Container>
			<Header title={props.route.params.productName} />
			<WhiteContainer style={{ paddingHorizontal: 0 }}>
				{isLoading ? (
					<Loader />
				) : (
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ paddingHorizontal: 20 }}
					>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<View style={{ width: "65%" }}>
								<Text style={styles.boldText}>{productDetails.name}</Text>
							</View>

							<View
								style={{
									width: "35%",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "flex-end",
								}}
							>
								<Text
									style={[
										styles.boldText,
										{ color: Colors.primaryBtn, fontSize: 12, marginTop: 4 },
									]}
								>
									{productDetails.price.code}
								</Text>
								<Text style={styles.productDetailsPriceValue}>
									{productDetails.price.value}
								</Text>
							</View>
						</View>

						<View style={[styles.itemRow, { marginTop: 20 }]}>
							<FontAwesomeIcon
								icon={faLocationDot}
								size={17}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Source"}</Text>
								<Text style={styles.value}>{productDetails.source}</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faLocationDot}
								size={17}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Destination"}</Text>
								<Text style={styles.value}>{productDetails.destination}</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faPersonSeat}
								size={19}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"No. of Passenger"}</Text>
								<Text style={styles.value}>
									{`${productDetails.numberOfSeats} (including driver)`}
								</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faSuitcaseRolling}
								size={19}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Luggage"}</Text>
								<Text
									style={styles.value}
									ellipsizeMode="tail"
									numberOfLines={2}
								>
									{productDetails.baggageInfo}
								</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faClock}
								size={16}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Service Time"}</Text>
								<Text style={styles.value}>
									{`${productDetails.startTime} - ${productDetails.endTime}`}
								</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faCalendarClock}
								size={16}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Reschedulable"}</Text>
								<Text
									style={[
										styles.value,
										{
											color: productDetails.isRescheduleable
												? Colors.success
												: Colors.danger,
										},
									]}
								>
									{productDetails.isRescheduleable ? "Yes" : "No"}
								</Text>
							</View>
						</View>

						{productDetails.isRescheduleable ? (
							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faClockRotateLeft}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 3 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>
										{"Minimum Rescheduling Hours"}
									</Text>
									<Text style={styles.value}>
										{productDetails.minRescheduleHour}
									</Text>
								</View>
							</View>
						) : null}

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faLanguage}
								size={18}
								color={Colors.secondary}
								style={{ marginTop: 1 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Language"}</Text>
								{Array.isArray(productDetails.languages) ? (
									productDetails.languages.length > 0 ? (
										<Text style={styles.value}>
											{getLanguageString(productDetails.languages)}
										</Text>
									) : (
										<Text style={styles.value}>{"N/A"}</Text>
									)
								) : (
									<Text style={styles.value}>{"N/A"}</Text>
								)}
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faClipboardCheck}
								size={18}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={styles.labelValueBox}>
								<Text style={styles.label}>{"Instant Confirmation"}</Text>
								<Text
									style={[
										styles.value,
										{
											color: productDetails.isBookingAutoAccept
												? Colors.success
												: Colors.danger,
										},
									]}
								>
									{productDetails.isBookingAutoAccept ? "Yes" : "No"}
								</Text>
							</View>
						</View>

						<View style={styles.itemRow}>
							<FontAwesomeIcon
								icon={faArrowRotateLeft}
								size={16}
								color={Colors.secondary}
								style={{ marginTop: 3 }}
							/>
							<View style={[styles.labelValueBox, { marginBottom: 5 }]}>
								<Text style={styles.label}>{"Refundable"}</Text>
								{productDetails.isRefundable ? (
									<>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
											}}
										>
											<Text style={[styles.value]}>
												{"Cancellation charges may apply."}
											</Text>
											<TouchableOpacity onPress={openRefundableModal}>
												<FontAwesomeIcon
													icon={faCircleInfo}
													size={15}
													style={{
														marginTop: 3,
														marginLeft: 5,
														color: Colors.primary,
													}}
												/>
											</TouchableOpacity>
										</View>
									</>
								) : (
									<Text
										style={[
											styles.value,
											{
												color: Colors.danger,
											},
										]}
									>
										{"No"}
									</Text>
								)}
							</View>
						</View>

						<Accordion
							data={[
								{
									title: "Features",
									content: productDetails.features.map(
										(item: string, index: number) => (
											<Li key={`features-${index}`} text={item} />
										)
									),
								},
								{
									title: "Inclusions",
									content: productDetails.inclusion.map(
										(item: string, index: number) => (
											<Li key={`inclusion-${index}`} text={item} />
										)
									),
								},
								{
									title: "Exclusions",
									content: productDetails.exclusion.map(
										(item: string, index: number) => (
											<Li key={`exclusion-${index}`} text={item} />
										)
									),
								},
							]}
						/>

						<Text style={[styles.sectionTitle]}>{"Booking Date & Time"}</Text>
						<Text style={[styles.label, { marginTop: 5, fontSize: 12 }]}>
							{"Local Time"}
						</Text>
						<Text style={[styles.value, { fontSize: 12, marginBottom: 8 }]}>
							{localDateTime}
						</Text>
						<Formik
							initialValues={{
								date: "",
								time: "",
							}}
							validationSchema={validationSchema}
							onSubmit={onBookingSubmit}
							innerRef={formikRef}
						>
							{({ handleSubmit, touched, errors }) => (
								<>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "space-between",
											width: "100%",
										}}
									>
										<View style={{ flex: 1, paddingRight: 10 }}>
											<Datepicker
												label="Preferred Date"
												value={date}
												minimumDate={moment()
													.tz(productDetails.timeZone)
													.format("YYYY-MM-DD")}
												hasError={(touched.date && errors.date) as boolean}
												onDateChange={setBookingDate}
											/>
											{touched.date && errors.date ? (
												<Text style={styles.errorText}>{errors.date}</Text>
											) : null}
										</View>
										<View style={{ flex: 1, paddingLeft: 10 }}>
											<TimePicker
												label="Preferred Time"
												minuteInterVal={15}
												minHour={Number(
													moment(productDetails.startTime, "HH:mm:ss").format(
														"H"
													)
												)}
												maxHour={
													Number(
														moment(productDetails.endTime, "HH:mm:ss").format(
															"H"
														)
													) + 1
												}
												value={time}
												onTimeChange={setBookingTime}
												hasError={(touched.time && errors.time) as boolean}
											/>
											{touched.time && errors.time ? (
												<Text style={styles.errorText}>{errors.time}</Text>
											) : null}
										</View>
									</View>

									{bookingErrorMsg !== null ? (
										<Text style={styles.errorText}>{bookingErrorMsg}</Text>
									) : null}

									<Button
										title="Book Now"
										style={{ marginVertical: 25 }}
										onPress={() => handleSubmit()}
									/>
								</>
							)}
						</Formik>
					</ScrollView>
				)}
			</WhiteContainer>

			<BottomSheet
				isVisible={isRefundableModalOpen}
				title={"Cancellation Charges"}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
				onClose={closeRefundableModal}
			>
				<View style={styles.modalBody}>
					<View style={{ flexDirection: "row" }}>
						<Text style={[styles.modalBodyHeader, { marginRight: 5 }]}>
							{"Minimum Cancellation Charge   - "}
						</Text>
						<View>
							<Text style={[styles.modalBodyHeader]}>
								{`${productDetails?.defaultCancellationCharge}%`}
							</Text>
						</View>
					</View>
					<Text
						style={[
							styles.modalBodyHeader,
							{
								marginTop: 15,
								marginBottom: 5,
							},
						]}
					>
						{"Other Cancellation Charges"}
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 8,
						}}
					>
						<FontAwesomeIcon
							icon={faSquare}
							size={8}
							color={Colors.mediumGrey}
						/>
						<Text
							style={[styles.otherChargesData]}
						>{`Before ${reversedCancellationCharges[0]?.max_hour}  Hrs  -  ${productDetails?.defaultCancellationCharge}%`}</Text>
					</View>

					{reversedCancellationCharges.map((item: any, index: any) => {
						return (
							<View
								key={`charge-${index}`}
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginBottom: 8,
								}}
							>
								<FontAwesomeIcon
									icon={faSquare}
									size={8}
									color={Colors.mediumGrey}
								/>
								<Text
									style={[styles.otherChargesData]}
								>{`Between ${item.min_hour} and ${item.max_hour} Hrs  -  ${item.percentage}%`}</Text>
							</View>
						);
					})}
				</View>
			</BottomSheet>

			<OverlayLoader visible={isOverlayModalOpen} />
			<BookingSuccessModal ref={bookingSuccessModalRef} />
		</Container>
	);
};

export default CarRentalAirportTransfer;

const styles = StyleSheet.create({
	dasedBorderContainer: {
		paddingLeft: 20,
		paddingBottom: 20,
		borderLeftWidth: 1,
		borderLeftColor: Colors.secondary,
		borderStyle: "dashed",
	},
	productDetailsPriceValue: {
		fontSize: 18,
		marginLeft: 3,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	label: {
		fontSize: 12,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.6,
	},
	value: {
		fontSize: 13,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	iconContainer: {
		backgroundColor: Colors.white,
		position: "absolute",
		top: -4,
		left: -10,
		paddingBottom: 2,
	},
	sectionTitle: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		marginTop: 15,
		marginBottom: 10,
	},
	languageChip: {
		height: 30,
		width: "auto",
		minWidth: 70,
		backgroundColor: Colors.white,
		borderWidth: 1,
		borderRadius: 20,
		marginHorizontal: 5,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 5,
		borderColor: Colors.lightBorder,
		paddingHorizontal: 8,
	},
	smallText: {
		fontSize: 11,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	tabView: {
		borderBottomColor: Colors.lightBorder,
		borderBottomWidth: 1,
		marginBottom: 5,
	},
	boldText: {
		fontSize: 16,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
		lineHeight: 15,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 15,
	},
	labelValueBox: {
		flex: 1,
		paddingLeft: 8,
	},
	modalBody: {
		padding: 20,
	},
	modalBodyHeader: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 15,
		lineHeight: 30,
		color: Colors.secondaryFont,
	},
	otherChargesTableHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	otherChargesTableBody: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 5,
		alignItems: "center",
	},
	otherChargesTableHeaderData: {
		fontFamily: "Roboto-Regular",
		fontWeight: "bold",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	otherChargesData: {
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
		marginLeft: 5,
		marginTop: 1,
	},
});
