import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleExclamation } from "@fortawesome/pro-regular-svg-icons/faCircleExclamation";
import { RescheduleScreenProps } from "../navigation/NavigationTypes";
import {
	Container,
	Header,
	Loader,
	WhiteContainer,
	AbsoluteLoader,
	RadioButton,
	TimePicker,
	Datepicker,
	Button,
} from "../components";
import Snackbar from "react-native-snackbar";
import OrderService from "../services/OrderService";
import moment from "moment";
import Colors from "../configs/Colors";
import ProductCategory from "../configs/ProductCategory";

const rescheduleSchema = Yup.object().shape({
	date: Yup.string().required("Select a date"),
	time: Yup.string().required("Select start time"),
	rescheduleReasonId: Yup.string().required("Select a reason for reschedule"),
});

type RescheduleFormModel = {
	date: string;
	time: string;
	rescheduleReasonId: string;
};
const Reschedule: React.FC<RescheduleScreenProps> = (
	props: RescheduleScreenProps
): React.ReactElement => {
	const orderId: string = props.route.params.orderId;
	const orderNumber: string = props.route.params.orderNumber;
	const category = props.route.params.category;
	const timeZone = props.route.params.timeZone;
	const minBookingHour = props.route.params.minBookingHour;
	const orderItemId = props.route.params.orderItemId;
	const bookingDateTime = props.route.params.bookingDateTime;
	const startTime = props.route.params.startTime;
	const productStartTime = props.route.params.productStartTime;
	const productEndTime = props.route.params.productEndTime;
	const formikRef = useRef<FormikProps<RescheduleFormModel>>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [rescheduleReasons, setRescheduleReasons] = useState<Array<any>>([]);
	const [date, setDate] = useState<null | string>(null);
	const [time, setTime] = useState<null | Date>(null);
	const [isOverlayModalOpen, setIsOverlayModalOpen] = useState<boolean>(false);
	const [bookingErrorMsg, setBookingErrorMsg] = useState<null | string>(null);

	useEffect(() => {
		OrderService.getRescheduleReasons(category)
			.then((response) => {
				setRescheduleReasons(response.data);
				setIsLoading(false);
			})
			.catch((error) => {
				setRescheduleReasons([]);
				setIsLoading(false);
			});
	}, []);

	const onSelectRescheduleReason = (id: any) => {
		formikRef && formikRef.current?.setFieldValue("rescheduleReasonId", id);
	};

	const setRescheduleBookingDate = (value: string) => {
		setDate(value);
		formikRef && formikRef.current?.setFieldValue("date", value);
	};

	const setRescheduleBookingTime = (value: Date) => {
		setTime(value);
		formikRef &&
			formikRef.current?.setFieldValue(
				"time",
				moment(value).format("HH:mm:ss")
			);
	};

	const onRescheduleOrder = (values: RescheduleFormModel) => {
		setBookingErrorMsg(null);

		const localDate: string = moment().tz(timeZone).format("YYYY-MM-DD");
		const localTime: string = moment().tz(timeZone).format("HH:mm");

		const localDateTimeWithBuffer = moment(`${localDate} ${localTime}`)
			.add(Number(minBookingHour), "hours")
			.format("YYYY-MM-DD HH:mm");
		const preferredDateTime = moment(`${values.date} ${values.time}`).format(
			"YYYY-MM-DD HH:mm"
		);

		let isProceed: boolean = false;

		if (
			moment(`${preferredDateTime}`, "YYYY-MM-DD HH:mm").isAfter(
				moment(`${localDateTimeWithBuffer}`, "YYYY-MM-DD HH:mm")
			)
		) {
			isProceed = true;
		} else {
			isProceed = false;
			setBookingErrorMsg(
				`** Next Booking is after ${minBookingHour} hours from the local time`
			);
		}

		if (isProceed) {
			const reqData = {
				date: values.date,
				time: values.time,
				reasonId: values.rescheduleReasonId,
				orderId: orderId,
				orderItemId: orderItemId,
			};
			setIsOverlayModalOpen(true);
			OrderService.rescheduleOrder(reqData)
				.then((response) => {
					setIsOverlayModalOpen(false);
					setDate(null);
					setTime(null);
					props.navigation.navigate("OrderDetails", {
						orderId: orderId,
						orderNo: orderNumber,
						orderItemId: orderItemId,
					});
					Snackbar.show({
						text: "Your booking has been rescheduled successfully.",
						duration: Snackbar.LENGTH_LONG,
					});
				})
				.catch((error) => {
					setIsOverlayModalOpen(false);
				});
		}
	};

	return (
		<Container>
			<Header title={"Reschedule"} />
			<WhiteContainer style={{ paddingHorizontal: 0 }}>
				{isLoading ? (
					<Loader />
				) : (
					<Formik
						innerRef={formikRef}
						initialValues={{
							date: "",
							time: "",
							rescheduleReasonId: "",
						}}
						validationSchema={rescheduleSchema}
						onSubmit={onRescheduleOrder}
					>
						{({ handleSubmit, touched, errors, values }) => (
							<View style={{ flex: 1, width: "100%", padding: 20 }}>
								<Text style={[styles.totalText, { marginBottom: 15 }]}>
									{"Please choose your reason for reschedule."}
								</Text>
								<View style={{ marginBottom: 15 }}>
									{rescheduleReasons.map((item: any, index: any) => {
										return (
											<RadioButton
												key={index}
												label={item.reason}
												isChecked={values.rescheduleReasonId === item._id}
												onPress={onSelectRescheduleReason.bind(this, item._id)}
												style={{
													paddingVertical: 15,
													alignItems: "flex-start",
												}}
												labelStyle={{ lineHeight: 14 }}
											/>
										);
									})}
									{touched.rescheduleReasonId && errors.rescheduleReasonId ? (
										<Text style={styles.errorText}>
											{errors.rescheduleReasonId}
										</Text>
									) : null}
								</View>

								<View style={styles.prevBookingBox}>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<FontAwesomeIcon
											icon={faCircleExclamation}
											size={14}
											style={{ marginRight: 5, color: Colors.primary }}
										/>
										<Text style={styles.prevBookingText}>
											{"Your previous booking was on "}
										</Text>
									</View>

									<>
										{category === ProductCategory.CAR_RENTAL ? (
											<Text style={styles.prevBookingText}>
												{moment
													.utc(bookingDateTime)
													.format("D MMMM, YYYY HH:mm")}
											</Text>
										) : (
											<Text style={styles.prevBookingText}>
												{moment.utc(bookingDateTime).format("D MMMM, YYYY") +
													" " +
													moment.utc(startTime, "HH:mm:ss").format("HH:mm")}
											</Text>
										)}
									</>
								</View>

								<View style={{ paddingVertical: 15 }}>
									<Datepicker
										label="Rescheduling Date"
										value={date}
										minimumDate={moment().tz(timeZone).format("YYYY-MM-DD")}
										hasError={(touched.date && errors.date) as boolean}
										onDateChange={setRescheduleBookingDate}
									/>
									{touched.date && errors.date ? (
										<Text style={styles.errorText}>{errors.date}</Text>
									) : null}
								</View>
								<View style={{ paddingVertical: 15 }}>
									<TimePicker
										label="Rescheduling Time"
										minuteInterVal={15}
										minHour={Number(
											moment(productStartTime, "HH:mm:ss").format("H")
										)}
										maxHour={
											Number(moment(productEndTime, "HH:mm:ss").format("H")) + 1
										}
										value={time}
										onTimeChange={setRescheduleBookingTime}
										hasError={(touched.time && errors.time) as boolean}
									/>
									{touched.time && errors.time ? (
										<Text style={styles.errorText}>{errors.time}</Text>
									) : null}
								</View>

								{bookingErrorMsg !== null ? (
									<Text style={styles.errorText}>{bookingErrorMsg}</Text>
								) : null}

								<View
									style={{
										width: "100%",
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "space-evenly",
										marginTop: 30,
									}}
								>
									<Button
										title={"Reschedule"}
										onPress={() => handleSubmit()}
										style={{ width: "100%", height: 45 }}
									/>
								</View>
							</View>
						)}
					</Formik>
				)}
			</WhiteContainer>
			<AbsoluteLoader isVisible={isOverlayModalOpen} />
		</Container>
	);
};

export default Reschedule;

const styles = StyleSheet.create({
	container: { padding: 0 },
	totalText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.black,
		fontSize: 16,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
	itemDetails: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 5,
		borderWidth: 0.2,
		backgroundColor: Colors.lightGrey,
		borderRadius: 2,
	},
	itemSubText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.8,
		marginTop: 2,
	},
	infoText: {
		marginLeft: 5,
		marginTop: 0,
	},
	prevBookingBox: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		padding: 6,
		backgroundColor: Colors.secondaryAlpha2,
		borderWidth: 1,
		borderColor: Colors.secondaryAlpha2,
		marginVertical: 10,
		borderRadius: 5,
	},
	prevBookingText: {
		fontSize: 12,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 18,
	},
});
