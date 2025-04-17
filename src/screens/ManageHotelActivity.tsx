import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
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
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import { HotelActivityScreenProps } from "../navigation/NavigationTypes";
import TourBookService from "../services/TourBookService";
import { isEmptyString } from "../utils/Util";
import AppContext from "../context/AppContext";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	hotelName: Yup.string().trim().required("Enter hotel name"),
	checkInDate: Yup.string().required("Select check in date"),
	// checkInTime: Yup.string().required("Select check in time"),
	checkOutDate: Yup.string().required("Select check out date"),
});

type FormModel = {
	hotelName: string;
	checkInDate: string;
	checkInTime: string;
	checkOutDate: string;
};

type States = {
	journeyId: string;
	cityId: string;
	cityName: string;
	activityName: string;
	activitySlug: string;
	activityId: undefined | string;
	checkInDate: null | string;
	checkInTime: null | Date;
	checkOutDate: null | string;
	isSubmitting: boolean;
};

export default class ManageHotelActivity extends React.Component<
	HotelActivityScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: HotelActivityScreenProps) {
		super(props);
		const { route } = this.props;
		this.state = {
			journeyId: route.params.journeyId,
			cityId: route.params.cityId,
			cityName: route.params.cityName,
			activityName: route.params.activityName,
			activitySlug: route.params.activitySlug,
			activityId: undefined,
			checkInDate: null,
			checkInTime: null,
			checkOutDate: null,
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
					checkInDate: route.params.checkInDate as string,
					checkInTime:
						typeof route.params.checkInTime !== "undefined"
							? new Date(
									`${moment().format("YYYY-MM-DD")} ${route.params.checkInTime}`
							  )
							: null,
					checkOutDate: route.params.checkOutDate as string,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"hotelName",
							route.params.hotelName
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"checkInDate",
							route.params.checkInDate
						);
					this.formikRef.current?.setFieldValue(
						"checkInTime",
						typeof route.params.checkInTime !== "undefined"
							? route.params.checkInTime
							: ""
					);
					this.formikRef.current?.setFieldValue(
						"checkOutDate",
						route.params.checkOutDate
					);
				}
			);
		}
	};

	setCheckInDate = (value: string) => {
		this.setState({ checkInDate: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("checkInDate", value);
		});
	};

	setCheckInTime = (value: Date) => {
		this.setState({ checkInTime: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"checkInTime",
					moment(value).format("HH:mm:ss")
				);
		});
	};

	setCheckOutDate = (value: string) => {
		this.setState({ checkOutDate: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("checkOutDate", value);
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
					hotelName: values.hotelName,
					checkInDate: values.checkInDate,
					checkOutDate: values.checkOutDate,
				};

				if (!isEmptyString(values.checkInTime)) {
					reqData.checkInTime = values.checkInTime;
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
					hotelName: values.hotelName,
					checkInDate: values.checkInDate,
					checkOutDate: values.checkOutDate,
				};

				if (!isEmptyString(values.checkInTime)) {
					reqData.checkInTime = values.checkInTime;
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
							? LocalizedText.EDIT_HOTEL
							: LocalizedText.ADD_HOTEL
					}
				/>
				<WhiteContainer>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{
								hotelName: "",
								checkInDate: "",
								checkInTime: "",
								checkOutDate: "",
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
								<>
									<InputField
										label={LocalizedText.HOTEL_NAME}
										value={values.hotelName}
										autoCapitalize="words"
										onChangeText={handleChange("hotelName")}
										onBlur={handleBlur("hotelName")}
										error={
											touched.hotelName && errors.hotelName
												? errors.hotelName
												: null
										}
									/>
									<Datepicker
										label={LocalizedText.CHECK_IN_DATE}
										value={this.state.checkInDate}
										// style={{ marginTop: 10 }}
										minimumDate={moment().format("YYYY-MM-DD")}
										onDateChange={this.setCheckInDate}
										hasError={
											(touched.checkInDate && errors.checkInDate) as boolean
										}
									/>
									{touched.checkInDate && errors.checkInDate ? (
										<Text style={styles.errorText}>{errors.checkInDate}</Text>
									) : null}

									<TimePicker
										label={LocalizedText.CHECK_IN_TIME}
										value={this.state.checkInTime}
										style={{ marginTop: 15 }}
										onTimeChange={this.setCheckInTime}
										hasError={
											(touched.checkInTime && errors.checkInTime) as boolean
										}
									/>
									<Datepicker
										label={LocalizedText.CHECK_OUT_DATE}
										value={this.state.checkOutDate}
										style={{ marginTop: 15 }}
										minimumDate={moment().format("YYYY-MM-DD")}
										onDateChange={this.setCheckOutDate}
										hasError={
											(touched.checkOutDate && errors.checkOutDate) as boolean
										}
									/>
									{touched.checkOutDate && errors.checkOutDate ? (
										<Text style={styles.errorText}>{errors.checkOutDate}</Text>
									) : null}

									<Button
										title={
											typeof this.props.route.params.activityId === "undefined"
												? LocalizedText.SUBMIT
												: LocalizedText.UPDATE
										}
										style={{ marginTop: 30 }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
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
	label: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 20,
		fontSize: 14,
		color: Colors.secondaryFont,
		marginTop: 15,
	},
	input: {
		width: "100%",
		paddingLeft: 0,
		paddingBottom: 5,
		color: Colors.secondaryFont,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
});
