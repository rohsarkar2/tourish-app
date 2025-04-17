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
	InputField,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import { EventActivityScreenProps } from "../navigation/NavigationTypes";
import TourBookService from "../services/TourBookService";
import AppContext from "../context/AppContext";

const validationSchema = Yup.object().shape({
	eventName: Yup.string().trim().required("Enter event name"),
	eventLocation: Yup.string().required("Enter event location"),
	eventDate: Yup.string().required("Select a date"),
	eventTime: Yup.string().required("Select start time"),
});

type FormModel = {
	eventName: string;
	eventLocation: string;
	eventDate: string;
	eventTime: string;
};

type States = {
	journeyId: string;
	cityId: string;
	cityName: string;
	activityName: string;
	activitySlug: string;
	activityId: undefined | string;
	eventDate: null | string;
	eventTime: null | Date;
	isSubmitting: boolean;
};

export default class ManageEventActivity extends React.Component<
	EventActivityScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: EventActivityScreenProps) {
		super(props);
		const { route } = this.props;
		this.state = {
			journeyId: route.params.journeyId,
			cityId: route.params.cityId,
			cityName: route.params.cityName,
			activityName: route.params.activityName,
			activitySlug: route.params.activitySlug,
			activityId: undefined,
			eventDate: null,
			eventTime: null,
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
					eventDate: route.params.eventDate as string,
					eventTime:
						typeof route.params.eventTime !== "undefined"
							? new Date(
									`${moment().format("YYYY-MM-DD")} ${route.params.eventTime}`
							  )
							: null,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"eventName",
							route.params.eventName
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"eventLocation",
							route.params.eventLocation
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"eventDate",
							route.params.eventDate
						);
					this.formikRef.current?.setFieldValue(
						"eventTime",
						typeof route.params.eventTime !== "undefined"
							? route.params.eventTime
							: ""
					);
				}
			);
		}
	};

	setEventDate = (value: string) => {
		this.setState({ eventDate: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("eventDate", value);
		});
	};

	setEventTime = (value: Date) => {
		this.setState({ eventTime: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"eventTime",
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
					eventName: values.eventName,
					eventLocation: values.eventLocation,
					eventDate: values.eventDate,
					eventTime: values.eventTime,
				};

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
					eventName: values.eventName,
					eventLocation: values.eventLocation,
					eventDate: values.eventDate,
					eventTime: values.eventTime,
				};

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
							? LocalizedText.EDIT_EVENT
							: LocalizedText.ADD_EVENT
					}
				/>
				<WhiteContainer>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{
								eventName: "",
								eventLocation: "",
								eventDate: "",
								eventTime: "",
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
										label={LocalizedText.EVENT_NAME}
										value={values.eventName}
										autoCapitalize="words"
										onChangeText={handleChange("eventName")}
										onBlur={handleBlur("eventName")}
										error={
											touched.eventName && errors.eventName
												? errors.eventName
												: null
										}
									/>
									<InputField
										label={LocalizedText.EVENT_LOCATION}
										value={values.eventLocation}
										autoCapitalize="words"
										onChangeText={handleChange("eventLocation")}
										onBlur={handleBlur("eventLocation")}
										error={
											touched.eventLocation && errors.eventLocation
												? errors.eventLocation
												: null
										}
									/>
									<Datepicker
										label={LocalizedText.EVENT_DATE}
										value={this.state.eventDate}
										style={{ marginTop: 10 }}
										minimumDate={moment().format("YYYY-MM-DD")}
										onDateChange={this.setEventDate}
										hasError={
											(touched.eventDate && errors.eventDate) as boolean
										}
									/>
									{touched.eventDate && errors.eventDate ? (
										<Text style={styles.errorText}>{errors.eventDate}</Text>
									) : null}

									<TimePicker
										label={LocalizedText.EVENT_TIME}
										value={this.state.eventTime}
										style={{ marginTop: 15 }}
										onTimeChange={this.setEventTime}
										hasError={
											(touched.eventTime && errors.eventTime) as boolean
										}
									/>
									{touched.eventTime && errors.eventTime ? (
										<Text style={styles.errorText}>{errors.eventTime}</Text>
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
