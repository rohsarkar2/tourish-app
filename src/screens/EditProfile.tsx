import React from "react";
import { ScrollView, Text, View, Alert, StyleSheet } from "react-native";
import Snackbar from "react-native-snackbar";
import moment from "moment-timezone";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	Datepicker,
	RadioButton,
	OverlayLoader,
	MobileInput,
	InputField,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import { EditProfileScreenProps } from "../navigation/NavigationTypes";
import {
	getAllCountries,
	getProfile,
	updateProfile,
} from "../services/ApiService";
import { isEmptyString } from "../utils/Util";
import AppContext from "../context/AppContext";

const validationSchema = Yup.object().shape({
	name: Yup.string()
		.trim()
		.required("Enter your name")
		.matches(
			/^(?=.{1,60}$)[a-z]+(?:['_.\s][a-z]+)*$/i,
			"Should not contain any number"
		),
	mobile: Yup.string()
		.trim()
		.min(4, "Minimum length is 4")
		.max(13, "Maximum length is 13")
		.matches(/^\d+$/, "Only accept number"),
});

type FormModel = {
	// countryId: string;
	name: string;
	callingCode: string;
	mobile: string;
	gender: string;
	dob: string;
};

type States = {
	countries: any[];
	selectedCountryID: undefined | string;
	selectedCountryName: string;
	countryCallingCode: undefined | string;
	twoLetterCountryCode: string;
	currency: null | {
		name: string;
		code: string;
		symbol: string;
		decimal_point: number;
	};
	email: string;
	mobile: string;
	gender: string;
	dob: null | string;
	isLoading: boolean;
};

export default class EditProfile extends React.Component<
	EditProfileScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: EditProfileScreenProps) {
		super(props);
		this.state = {
			countries: [],
			selectedCountryID: undefined,
			selectedCountryName: "",
			countryCallingCode: undefined,
			twoLetterCountryCode: "",
			currency: null,
			email: "",
			mobile: "",
			gender: "",
			dob: null,
			isLoading: true,
		};
		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		Promise.all([getAllCountries(), getProfile()])
			.then((response: any[]) => {
				const data = response[1].data;

				let callingCode = `${data.country.callingCode}`;
				if (data.callingCode !== null) {
					callingCode = data.callingCode.replace("+", "");
				}

				this.setState(
					{
						countries: response[0],
						email: data.email,
						mobile: data.mobileNo !== null ? data.mobileNo : "",
						selectedCountryID: data.country._id,
						selectedCountryName: data.country.name,
						countryCallingCode: callingCode,
						twoLetterCountryCode: data.country.code,
						currency: {
							name: data.currency.name,
							code: data.currency.code,
							symbol: data.currency.symbol,
							decimal_point: data.currency.decimal_point,
						},
						gender: data.gender === null ? "" : data.gender,
						dob:
							data.dob === null
								? null
								: moment.utc(data.dob).format("YYYY-MM-DD"),
						isLoading: false,
					},
					() => {
						// this.formikRef &&
						// 	this.formikRef.current?.setFieldValue(
						// 		"countryId",
						// 		data.country._id
						// 	);
						this.formikRef &&
							this.formikRef.current?.setFieldValue("name", data.name);
						this.formikRef &&
							this.formikRef.current?.setFieldValue("callingCode", callingCode);
						this.formikRef &&
							this.formikRef.current?.setFieldValue(
								"mobile",
								data.mobileNo !== null ? data.mobileNo : ""
							);
						this.formikRef &&
							this.formikRef.current?.setFieldValue(
								"gender",
								data.gender === null ? "" : data.gender
							);
						this.formikRef &&
							this.formikRef.current?.setFieldValue(
								"dob",
								data.dob === null ? "" : moment(data.dob).format("YYYY-MM-DD")
							);
					}
				);
			})
			.catch((error) => {
				this.setState({ isLoading: false });
			});
	};

	// onSelectCountry = (item: any) => {
	// 	this.setState(
	// 		{
	// 			selectedCountryID: item._id,
	// 			selectedCountryName: item.name,
	// 			countryCallingCode: item.calling_code,
	// 			twoLetterCountryCode: item.code2,
	// 			currency: {
	// 				name: item.currency.name,
	// 				code: item.currency.code,
	// 				symbol: item.currency.symbol,
	// 				decimal_point: item.currency.decimal_point,
	// 			},
	// 		},
	// 		() => {
	// 			this.formikRef &&
	// 				this.formikRef.current?.setFieldValue("countryId", item._id);
	// 			this.formikRef &&
	// 				this.formikRef.current?.setFieldValue(
	// 					"callingCode",
	// 					`${item.calling_code}`
	// 				);
	// 			this.formikRef && this.formikRef.current?.setFieldValue("mobile", "");
	// 		}
	// 	);
	// };

	onChangeCountryCode = (code: string) => {
		this.setState({ countryCallingCode: code }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("callingCode", `${code}`);
		});
	};

	setMobile = (str: string) => {
		this.setState({ mobile: str.trim() }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("mobile", str.trim());
		});
	};

	setGender = (value: string) => {
		this.setState({ gender: value }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("gender", value);
		});
	};

	setDob = (value: string) => {
		this.setState({ dob: value }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("dob", value);
		});
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: FormModel) => {
		const { userData } = this.context;
		const modUserData: any = {
			...userData,
			name: values.name,
			// country: {
			// 	_id: values.countryId,
			// 	name: this.state.selectedCountryName,
			// 	code: this.state.twoLetterCountryCode,
			// },
			// currency: this.state.currency,
		};

		const reqData: any = {
			// country_id: values.countryId,
			name: values.name.trim(),
		};

		if (!isEmptyString(values.mobile)) {
			reqData.mobile = values.mobile.trim();
			reqData.callingCode = `+${values.callingCode}`;
			modUserData.mobile = `+${values.callingCode}${values.mobile.trim()}`;
		}
		if (!isEmptyString(values.gender)) {
			reqData.gender = values.gender;
		}
		if (!isEmptyString(values.dob)) {
			reqData.dob = values.dob;
		}

		this.setState({ isLoading: true }, () => {
			updateProfile(reqData)
				.then((response) => {
					this.setState({ isLoading: false }, () => {
						if (response.check === true) {
							this.context.setUserData(modUserData);
							setTimeout(() => {
								Snackbar.show({
									text: "Profile updated successfully",
									duration: Snackbar.LENGTH_LONG,
								});
							}, 350);
						} else {
							Alert.alert(LocalizedText.FAILED, response.message);
						}
					});
				})
				.catch((error) => {
					this.setState({ isLoading: false });
				});
		});
	};

	render = () => {
		return (
			<Container>
				<Header title={LocalizedText.EDIT_PROFILE} />
				<WhiteContainer>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{
								// countryId: "",
								name: "",
								callingCode: "",
								mobile: "",
								gender: "",
								dob: "",
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
										label={"Country"}
										value={this.state.selectedCountryName}
										editable={false}
									/>
									<InputField
										label={LocalizedText.NAME}
										value={values.name}
										autoCapitalize="words"
										onChangeText={handleChange("name")}
										onBlur={handleBlur("name")}
										error={touched.name && errors.name ? errors.name : null}
									/>
									<InputField
										editable={false}
										label={LocalizedText.EMAIL}
										value={this.state.email}
									/>
									<MobileInput
										callingCode={this.state.countryCallingCode}
										countries={this.state.countries}
										value={values.mobile}
										onChangeText={this.setMobile}
										onChangeCountryCode={this.onChangeCountryCode}
										style={{ marginTop: 15 }}
										error={
											touched.mobile && errors.mobile ? errors.mobile : null
										}
									/>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											marginTop: 20,
											marginBottom: 10,
										}}
									>
										<Text
											style={{
												fontFamily: "Roboto-Regular",
												fontWeight: "400",
												fontSize: 12,
												color: Colors.secondaryFont,
												opacity: 0.6,
											}}
										>
											{LocalizedText.GENDER}
										</Text>

										<View
											style={{ flexDirection: "row", alignItems: "center" }}
										>
											<RadioButton
												label={LocalizedText.MALE}
												isChecked={values.gender === "Male"}
												onPress={this.setGender.bind(this, "Male")}
												style={{ marginRight: 10 }}
											/>
											<RadioButton
												label={LocalizedText.FEMALE}
												isChecked={values.gender === "Female"}
												onPress={this.setGender.bind(this, "Female")}
												style={{ marginRight: 10 }}
											/>
											<RadioButton
												label={LocalizedText.OTHERS}
												isChecked={values.gender === "Others"}
												onPress={this.setGender.bind(this, "Others")}
											/>
										</View>
									</View>
									{touched.gender && errors.gender ? (
										<Text
											style={{
												fontFamily: "Roboto-Regular",
												fontWeight: "400",
												fontSize: 12,
												color: Colors.danger,
											}}
										>
											{LocalizedText.GENDER_ERROR}
										</Text>
									) : null}
									<Datepicker
										label={LocalizedText.DATE_OF_BIRTH}
										value={this.state.dob}
										style={{ marginTop: 10 }}
										onDateChange={this.setDob}
									/>
									<Button
										title={LocalizedText.UPDATE}
										style={{ marginTop: 40 }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</ScrollView>
				</WhiteContainer>
				<OverlayLoader visible={this.state.isLoading} />
			</Container>
		);
	};
}
