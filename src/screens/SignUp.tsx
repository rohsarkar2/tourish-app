import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	Alert,
	Platform,
} from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye } from "@fortawesome/pro-light-svg-icons/faEye";
import { faEyeSlash } from "@fortawesome/pro-light-svg-icons/faEyeSlash";
import { faSquare } from "@fortawesome/pro-light-svg-icons/faSquare";
import { faSquareCheck } from "@fortawesome/pro-solid-svg-icons/faSquareCheck";
import messaging from "@react-native-firebase/messaging";
import Colors from "../configs/Colors";
import {
	CountryPicker,
	MobileInput,
	Button,
	OverlayLoader,
	OtpInputModal,
	TermsAndConditions,
	InputField,
} from "../components";
import CurrencyPicker from "../components/CurrencyPicker";
import {
	getAllCountries,
	sendOTP,
	verifyOTP,
	createAccount,
	getAllCurrencies,
} from "../services/ApiService";
import Constant from "../configs/Constant";
import {
	saveAccessToken,
	requestNotificationPermission,
	saveRefreshToken,
	saveBiometricValue,
} from "../utils/Util";
import { SignUpScreenProps } from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import ReactNativeBiometrics from "react-native-biometrics";

const winWidth = Dimensions.get("window").width;
const winHeight = Dimensions.get("window").height;

const signUpSchema = Yup.object().shape({
	countryId: Yup.string().required("Select a country name"),
	currencyCode: Yup.string().required("Select a Currency"),
	name: Yup.string()
		.trim()
		.required("Enter your name")
		.matches(
			/^(?=.{1,60}$)[a-z]+(?:['_.\s][a-z]+)*$/i,
			"Should not contain any number"
		),
	email: Yup.string()
		.required("Enter your email")
		.matches(/^[a-z][0-9a-z]/i, "Email should not start with number")
		.matches(/^\S*$/, "Email should not contain any space")
		.matches(
			/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			"Please enter valid email"
		),
	mobile: Yup.string()
		.required("Enter your mobile number")
		.min(4, "Enter your mobile number")
		.max(13, "Enter your mobile number")
		.matches(/^\d+$/, "Only takes number"),
	password: Yup.string()
		.required("Enter your password")
		.min(8, "Password must contain at least 8 characters")
		.matches(
			/[a-z]/,
			"Password must contain at least 8 characters with 1 character in capital, 1 number and 1 special character"
		)
		.matches(/[A-Z]/, "Password must have one uppercase letter")
		.matches(/\d/, "Password must have one number")
		.matches(
			/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
			"Password must have one special character"
		),
	confirmPassword: Yup.string()
		.required("Enter confirm password")
		.oneOf([Yup.ref("password")], "Password and confirm password not match"),
	ageConfirm: Yup.bool().oneOf([true], "Please confirmed your age"),
	acceptTermsAndCondition: Yup.bool().oneOf(
		[true],
		"Please accept our Terms & Conditions"
	),
});

type FormModel = {
	countryId: string;
	currencyCode: string;
	name: string;
	email: string;
	mobile: string;
	password: string;
	confirmPassword: string;
	ageConfirm: boolean;
	acceptTermsAndCondition: boolean;
};

type States = {
	countries: any[];
	currencies: any[];
	selectedCountryID: undefined | string;
	selectedCountryName: string;
	countryCallingCode: undefined | string;
	selectedCurrency: null | {
		name: string;
		code: string;
		decimal_point: number;
	};
	name: string;
	email: string;
	mobile: string;
	password: string;
	visiblePassword: boolean;
	isCheckTerm: boolean;
	isEmailExist: boolean;
	isMobileExist: boolean;
	isOtpModalOpen: boolean;
	isTermsAndConditionsModalOpen: boolean;
	isCurrencyFound: boolean;
	currencyNotFoundText: null | string;
	showLoader: boolean;
};

export default class SignUp extends React.Component<SignUpScreenProps, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: SignUpScreenProps) {
		super(props);

		this.state = {
			countries: [],
			currencies: [],
			selectedCountryID: undefined,
			selectedCountryName: "",
			countryCallingCode: undefined,
			selectedCurrency: null,
			name: "",
			email: "",
			mobile: "",
			password: "",
			isCheckTerm: false,
			visiblePassword: false,
			isEmailExist: false,
			isMobileExist: false,
			isOtpModalOpen: false,
			isTermsAndConditionsModalOpen: false,
			isCurrencyFound: true,
			currencyNotFoundText: null,
			showLoader: true,
		};

		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		Promise.all([getAllCountries(), getAllCurrencies()])
			.then((response) => {
				this.setState({
					showLoader: false,
					countries: response[0],
					currencies: response[1].data,
				});
			})
			.catch((error) => {
				this.setState({ showLoader: false });
			});
	};

	onSelectCountry = (item: any) => {
		const { currencies } = this.state;
		const index: number = currencies.findIndex(
			(element: any) => element.code === item.currency.code
		);

		if (index > -1) {
			this.setState(
				{
					selectedCountryID: item._id,
					selectedCountryName: item.name,
					countryCallingCode: item.calling_code,
					selectedCurrency: currencies[index],
					currencyNotFoundText: null,
					isCurrencyFound: true,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue("countryId", item._id);
					this.formikRef &&
						this.formikRef.current?.setFieldValue(
							"currencyCode",
							item.currency.code
						);
				}
			);
		} else {
			this.setState(
				{
					selectedCountryID: item._id,
					selectedCountryName: item.name,
					countryCallingCode: item.calling_code,
					selectedCurrency: null,
					isCurrencyFound: false,
					currencyNotFoundText: `The selected currency (${item.currency.code}) does not belong in our transaction currencies. Please choose one from below.`,
				},
				() => {
					this.formikRef &&
						this.formikRef.current?.setFieldValue("countryId", item._id);
					this.formikRef &&
						this.formikRef.current?.setFieldValue("currencyCode", "");
				}
			);
		}
	};

	onSelectCurrency = (item: any) => {
		this.setState({ selectedCurrency: item }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("currencyCode", item.code);
		});
	};

	setName = (str: string) => {
		this.setState({ name: str }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("name", str);
		});
	};

	setEmail = (str: string) => {
		this.setState({ email: str.trim().toLowerCase() }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"email",
					str.trim().toLowerCase()
				);
		});
	};

	setMobile = (str: string) => {
		this.setState({ mobile: str.trim() }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("mobile", str.trim());
		});
	};

	onChangeCountryCode = (code: string) => {
		this.setState({ countryCallingCode: code });
	};

	toggleVisiblePassword = () => {
		this.setState({ visiblePassword: !this.state.visiblePassword });
	};

	setPassword = (pass: string) => {
		this.setState({ password: pass }, () => {
			this.formikRef && this.formikRef.current?.setFieldValue("password", pass);
		});
	};

	onConfirmAge = (value: boolean) => {
		this.formikRef &&
			this.formikRef.current?.setFieldValue("ageConfirm", !value);
	};

	toggleTermsAndConditions = () => {
		const { isCheckTerm } = this.state;
		if (isCheckTerm) {
			this.setState({ isCheckTerm: false }, () => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue(
						"acceptTermsAndCondition",
						false
					);
			});
		} else {
			this.setState({ isTermsAndConditionsModalOpen: true });
		}
	};

	openTermsAndConditionModal = () => {
		this.setState({ isTermsAndConditionsModalOpen: true });
	};

	onCloseModal = () => {
		this.setState({ isTermsAndConditionsModalOpen: false });
	};

	onToggleTerms = (value: boolean) => {
		this.setState({ isCheckTerm: value }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("acceptTermsAndCondition", value);
		});
	};

	gotoSignIn = () => {
		this.props.navigation.pop(1);
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: FormModel) => {
		/*
		this.sendOtp();

		const reqStatus = await messaging().requestPermission();
		const isGranted: boolean =
			reqStatus === messaging.AuthorizationStatus.AUTHORIZED ||
			reqStatus === messaging.AuthorizationStatus.PROVISIONAL;

		if (isGranted) {
			this.sendOtp();
		}*/

		requestNotificationPermission(async () => {
			await messaging().registerDeviceForRemoteMessages();
			this.sendOtp();
		});
	};

	sendOtp = () => {
		this.setState({ showLoader: true }, () => {
			const reqData = {
				email: this.state.email,
				mobile: this.state.mobile,
			};

			sendOTP(reqData)
				.then((response) => {
					if (response.check === true) {
						this.setState({ showLoader: false, isOtpModalOpen: true });
					} else {
						const message = response.message.toLowerCase();
						this.setState({
							isEmailExist: message.indexOf("email") > -1,
							isMobileExist: message.indexOf("mobile") > -1,
							showLoader: false,
						});
					}
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	onResendOTP = () => {
		this.sendOtp();
	};

	onVerifyOTP = (code: any) => {
		const reqData = {
			email: this.state.email,
			otp: Number(code),
			purpose: Constant.OTP_PURPOSE_SIGN_UP,
		};

		verifyOTP(reqData)
			.then((response) => {
				if (response.check === true) {
					this.setState({ isOtpModalOpen: false }, () => {
						setTimeout(() => {
							this.setState({ showLoader: true }, async () => {
								const { selectedCurrency } = this.state;
								const deviceToken = await messaging().getToken();
								const reqData: any = {
									name: this.state.name,
									email: this.state.email,
									mobile: this.state.mobile,
									country_id: this.state.selectedCountryID,
									callingCode: `+${this.state.countryCallingCode}`,
									currency: {
										code: selectedCurrency?.code,
										name: selectedCurrency?.name,
										decimal_point: Number(selectedCurrency?.decimal_point),
									},
									password: this.state.password,
									deviceToken: deviceToken,
								};

								createAccount(reqData)
									.then((accountResponse) => {
										this.setState({ showLoader: false }, async () => {
											if (accountResponse.check === true) {
												const userData = accountResponse.data;
												const accessToken: string = userData.accessToken;
												const refreshToken: string = userData.refreshToken;

												userData.total_cart_items = 0;

												delete userData.accessToken;
												delete userData.refreshToken;

												saveAccessToken(accessToken);
												saveRefreshToken(refreshToken);
												this.context.setUserData(userData);

												const rnBiometrics = new ReactNativeBiometrics();
												const { available } =
													await rnBiometrics.isSensorAvailable();

												if (available) {
													Alert.alert(
														"Biometric",
														"Do you want to allow biomteric authentication for future login purposes?",
														[
															{
																text: "No",
																style: "cancel",
																onPress: async () => {
																	await saveBiometricValue("NO");
																	this.props.navigation.pop(1);
																},
															},
															{
																text: "Yes",
																onPress: async () => {
																	await saveBiometricValue("YES");
																	this.props.navigation.pop(1);
																},
															},
														]
													);
												} else {
													setTimeout(() => {
														this.props.navigation.pop(1);
													}, 350);
												}
												// setTimeout(() => {
												// 	this.props.navigation.pop(2);
												// }, 350);
											} else {
												Alert.alert("Error", accountResponse.message);
											}
										});
									})
									.catch((error) => {
										this.setState({ showLoader: false });
									});
							});
						}, 300);
					});
				} else {
					this.setState({ showLoader: false }, () => {
						Alert.alert("Failed", response.message);
					});
				}
			})
			.catch((error) => {
				this.setState({ showLoader: false });
			});
	};

	closeOtpInputModal = () => {
		this.setState({ isOtpModalOpen: false });
	};

	render = () => (
		<View style={styles.container}>
			<View style={styles.signupContainer}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.header} />
					<Text style={styles.title}>{"Let's get started"}</Text>
					<Text style={styles.subHeading}>{"Create your account"}</Text>
					<View style={{ marginBottom: 15 }} />

					<Formik
						innerRef={this.formikRef}
						initialValues={{
							countryId: "",
							currencyCode: "",
							name: "",
							email: "",
							mobile: "",
							password: "",
							confirmPassword: "",
							ageConfirm: false,
							acceptTermsAndCondition: false,
						}}
						validationSchema={signUpSchema}
						onSubmit={this.onSubmit}
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
								<CountryPicker
									countries={this.state.countries}
									placeholder={"Country"}
									onSelectCountry={this.onSelectCountry}
									selectedCountryID={values.countryId}
									selectedCountryName={this.state.selectedCountryName}
									error={
										touched.countryId && errors.countryId
											? errors.countryId
											: null
									}
								/>

								{this.state.isCurrencyFound ? null : (
									<>
										<View style={styles.cuurencyAlertBox}>
											<Text style={styles.currencyAlertText}>
												{this.state.currencyNotFoundText}
											</Text>
										</View>
										<View style={{ marginTop: 10 }}>
											<CurrencyPicker
												variant={"DROPDOWN"}
												currencies={this.state.currencies}
												selectedCurrency={this.state.selectedCurrency}
												onSelect={this.onSelectCurrency}
												error={
													touched.currencyCode && errors.currencyCode
														? errors.currencyCode
														: null
												}
											/>
										</View>
									</>
								)}

								<InputField
									value={values.name}
									label={"Name"}
									autoCapitalize="words"
									onChangeText={this.setName}
									error={touched.name && errors.name ? errors.name : null}
								/>

								<InputField
									value={values.email}
									label={"Email"}
									autoCapitalize="none"
									onChangeText={this.setEmail}
									error={
										touched.email && errors.email
											? errors.email
											: this.state.isEmailExist
											? "Email id is already exist"
											: null
									}
								/>
								<View>
									<MobileInput
										callingCode={this.state.countryCallingCode}
										countries={this.state.countries}
										value={values.mobile}
										onChangeText={this.setMobile}
										onChangeCountryCode={this.onChangeCountryCode}
										style={{ marginTop: 10 }}
										error={
											touched.mobile && errors.mobile
												? errors.mobile
												: this.state.isMobileExist
												? "Mobile number is already exist"
												: null
										}
									/>
								</View>
								<View style={{ width: "100%", marginTop: 10 }}>
									<InputField
										secureTextEntry={!this.state.visiblePassword}
										value={values.password}
										label={"Password"}
										autoCapitalize="none"
										onChangeText={this.setPassword}
										error={touched.password ? errors.password : null}
									/>
									<TouchableOpacity
										style={[
											styles.eyeBtn,
											touched.password && errors.password
												? { bottom: 15 }
												: null,
										]}
										onPress={this.toggleVisiblePassword}
									>
										<FontAwesomeIcon
											icon={this.state.visiblePassword ? faEye : faEyeSlash}
											size={18}
											color={Colors.secondaryFont}
										/>
									</TouchableOpacity>
								</View>

								<InputField
									secureTextEntry={true}
									value={values.confirmPassword}
									label={"Confirm Password"}
									autoCapitalize="none"
									onChangeText={handleChange("confirmPassword")}
									onBlur={handleBlur("confirmPassword")}
									error={
										touched.confirmPassword ? errors.confirmPassword : null
									}
								/>

								<View
									style={{
										flexDirection: "row",
										marginTop: 20,
										marginBottom: 10,
										alignItems: "center",
									}}
								>
									<TouchableOpacity
										onPress={this.onConfirmAge.bind(this, values.ageConfirm)}
									>
										<FontAwesomeIcon
											icon={values.ageConfirm ? faSquareCheck : faSquare}
											size={20}
											color={
												values.ageConfirm
													? Colors.primaryBtn
													: Colors.mediumGrey
											}
										/>
									</TouchableOpacity>
									<Text style={[styles.tcLight, { marginLeft: 5 }]}>
										{"I confirmed that, I am 16 years or older."}
									</Text>
								</View>
								{touched.ageConfirm && errors.ageConfirm ? (
									<Text style={styles.errorText}>{errors.ageConfirm}</Text>
								) : null}

								<View
									style={{
										flexDirection: "row",
										marginVertical: 10,
										alignItems: "center",
									}}
								>
									<TouchableOpacity onPress={this.toggleTermsAndConditions}>
										<FontAwesomeIcon
											icon={
												values.acceptTermsAndCondition
													? faSquareCheck
													: faSquare
											}
											size={20}
											color={
												values.acceptTermsAndCondition
													? Colors.primaryBtn
													: Colors.mediumGrey
											}
										/>
									</TouchableOpacity>
									<Text style={[styles.tcLight, { marginLeft: 5 }]}>
										{"By signing up, you are agree with our "}
									</Text>
									<TouchableOpacity onPress={this.openTermsAndConditionModal}>
										<Text style={styles.tcBold}>{"Terms & Conditions"}</Text>
									</TouchableOpacity>
								</View>

								{touched.acceptTermsAndCondition &&
								errors.acceptTermsAndCondition ? (
									<Text style={styles.errorText}>
										{errors.acceptTermsAndCondition}
									</Text>
								) : null}

								<Button
									title={"Sign Up"}
									style={{ marginTop: 30 }}
									onPress={this.onHandleValidation.bind(this, handleSubmit)}
								/>
							</>
						)}
					</Formik>

					<View style={styles.signupTextContainer}>
						<Text style={styles.signupText}>{"Already have an account?"}</Text>
						<TouchableOpacity onPress={this.gotoSignIn} style={{ padding: 5 }}>
							<Text style={styles.signupBoldText}>{"Sign In"}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>

			{this.state.isOtpModalOpen ? (
				<OtpInputModal
					isVisible={this.state.isOtpModalOpen}
					email={this.state.email}
					onResend={this.onResendOTP}
					onSubmit={this.onVerifyOTP}
				/>
			) : null}

			<TermsAndConditions
				title={"Terms and Conditions"}
				isVisible={this.state.isTermsAndConditionsModalOpen}
				closeModal={this.onCloseModal}
				onToggle={this.onToggleTerms}
				isShowButton={true}
			/>

			<OverlayLoader visible={this.state.showLoader} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		backgroundColor: Colors.white,
	},
	header: {
		width: winWidth,
		height: Math.floor((winHeight * 3) / 100),
		backgroundColor: "transparent",
	},
	signupContainer: {
		flex: 1,
		padding: 20,
		paddingBottom: 0,
		backgroundColor: "transparent",
	},
	title: {
		fontSize: 27,
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 40,
	},
	subHeading: {
		fontSize: 14,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
		opacity: 0.6,
		lineHeight: 19,
		marginBottom: 20,
	},
	cuurencyAlertBox: {
		width: "100%",
		padding: 6,
		backgroundColor: Colors.secondaryAlpha2,
		borderWidth: 1,
		borderColor: Colors.secondaryAlpha2,
		marginVertical: 10,
		borderRadius: 5,
	},
	currencyAlertText: {
		fontSize: 12,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 18,
	},
	signupTextContainer: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 20,
	},
	signupText: {
		fontSize: 15,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		textAlign: "center",
		opacity: 0.5,
		lineHeight: 23,
	},
	signupBoldText: {
		fontSize: 15,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 23,
	},
	eyeBtn: {
		position: "absolute",
		right: 0,
		bottom: 15,
		padding: 8,
	},
	ruleBox: {
		flexDirection: "row",
		alignItems: "center",
		width: "50%",
	},
	passRule: {
		marginLeft: 5,
		fontSize: 14,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.5,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		lineHeight: 20,
	},
	tcTextContainer: {
		width: "100%",
		height: 60,
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	tcLight: {
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.5,
		letterSpacing: -0.3,
	},
	tcBold: {
		fontSize: 13,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primary,
		textDecorationLine: "underline",
		letterSpacing: -0.3,
	},
	passRuleText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
	},
	label: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.lightFont,
		opacity: 0.6,
		position: "absolute",
		top: -3,
	},
	dropdown: {
		height: 45,
		width: "100%",
		flexDirection: "row",
		marginBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.mediumGrey,
	},
	dropdownInput: {
		width: "90%",
		height: "100%",
		paddingLeft: 0,
		paddingBottom: 5,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
	},
	dropdownCaret: {
		width: "10%",
		alignItems: "flex-end",
		justifyContent: "center",
	},
});
