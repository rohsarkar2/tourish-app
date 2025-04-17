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
import { CabActivityScreenProps } from "../navigation/NavigationTypes";
import TourBookService from "../services/TourBookService";
import { isEmptyString } from "../utils/Util";
import AppContext from "../context/AppContext";

const validationSchema = Yup.object().shape({
	serviceProvider: Yup.string().required("Enter service provider name"),
	date: Yup.string().required("Select a date"),
});

type FormModel = {
	serviceProvider: string;
	date: string;
	time: string;
};

type States = {
	journeyId: string;
	cityId: string;
	cityName: string;
	activityName: string;
	activitySlug: string;
	activityId: undefined | string;
	date: null | string;
	time: null | Date;
	isSubmitting: boolean;
};

export default class ManageCabActivity extends React.Component<
	CabActivityScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: CabActivityScreenProps) {
		super(props);
		const { route } = this.props;
		this.state = {
			journeyId: route.params.journeyId,
			cityId: route.params.cityId,
			cityName: route.params.cityName,
			activityName: route.params.activityName,
			activitySlug: route.params.activitySlug,
			activityId: undefined,
			date: null,
			time: null,
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
					date: route.params.date as string,
					time:
						typeof route.params.time !== "undefined"
							? new Date(
									`${moment().format("YYYY-MM-DD")} ${route.params.time}`
							  )
							: null,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"serviceProvider",
							route.params.serviceProvider
						);
					this.formikRef &&
						this.formikRef.current?.setFieldValue("date", route.params.date);
					this.formikRef.current?.setFieldValue(
						"time",
						typeof route.params.time !== "undefined" ? route.params.time : ""
					);
				}
			);
		}
	};

	setArrivalDate = (value: string) => {
		this.setState({ date: value }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("date", value);
		});
	};

	setArrivalTime = (value: Date) => {
		this.setState({ time: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"time",
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
					serviceProvider: values.serviceProvider,
					date: values.date,
				};

				if (!isEmptyString(values.time)) {
					reqData.time = values.time;
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
					serviceProvider: values.serviceProvider,
					date: values.date,
				};

				if (!isEmptyString(values.time)) {
					reqData.time = values.time;
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
							? LocalizedText.EDIT_CAB
							: LocalizedText.ADD_CAB
					}
				/>
				<WhiteContainer>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{
								serviceProvider: "",
								date: "",
								time: "",
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
										label={LocalizedText.CAB_SERVICE_PROVIDER}
										value={values.serviceProvider}
										autoCapitalize="words"
										onChangeText={handleChange("serviceProvider")}
										onBlur={handleBlur("serviceProvider")}
										error={
											touched.serviceProvider && errors.serviceProvider
												? errors.serviceProvider
												: null
										}
									/>
									<Datepicker
										label={LocalizedText.CAB_DATE}
										value={this.state.date}
										style={{ marginTop: 5 }}
										minimumDate={moment().format("YYYY-MM-DD")}
										onDateChange={this.setArrivalDate}
										hasError={(touched.date && errors.date) as boolean}
									/>
									{touched.date && errors.date ? (
										<Text style={styles.errorText}>{errors.date}</Text>
									) : null}

									<TimePicker
										label={LocalizedText.CAB_TIME}
										value={this.state.time}
										style={{ marginTop: 30 }}
										onTimeChange={this.setArrivalTime}
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
