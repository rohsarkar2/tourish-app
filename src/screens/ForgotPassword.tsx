import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	Alert,
} from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye } from "@fortawesome/pro-light-svg-icons/faEye";
import { faEyeSlash } from "@fortawesome/pro-light-svg-icons/faEyeSlash";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { Button, OverlayLoader, OtpInputModal } from "../components";
import LocalizedText from "../resources/LocalizedText";
import {
	verifyAccount,
	verifyOTP,
	resetPassword,
} from "../services/ApiService";
import { ForgotPasswordScreenProps } from "../navigation/NavigationTypes";
import { saveAccessToken, saveRefreshToken } from "../utils/Util";
import InputField from "../components/InputField";

const winWidth = Dimensions.get("window").width;
const winHeight = Dimensions.get("window").height;

const verifyAccountSchema = Yup.object().shape({
	email: Yup.string()
		.required("Enter your email")
		.matches(/^[a-z][0-9a-z]/i, "Email should not start with number")
		.matches(/^\S*$/, "Email should not contain any space")
		.matches(
			/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			"Please enter valid email"
		),
});

const resetPasswordSchema = Yup.object().shape({
	password: Yup.string()
		.required("Enter new password")
		.min(8, "Password must contain at least 8 characters")
		.matches(
			/[A-Z]/,
			"Password must contain at least 8 characters with 1 character in capital, 1 number and 1 special character"
		)
		.matches(/[a-z]/, "Password must have one uppercase letter")
		.matches(
			/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
			"Password must have one special character"
		)
		.matches(/\d/, "Password must have one number"),
	confirmPassword: Yup.string()
		.required("Enter confirm password")
		.oneOf([Yup.ref("password")], "Password and confirm password not match"),
});

type FormModel = {
	email: string;
};

type States = {
	email: string;
	accessToken: undefined | string;
	validationFailedMsg: null | string;
	isPasswordFormOpen: boolean;
	visiblePassword: boolean;
	isOtpModalOpen: boolean;
	showLoader: boolean;
};

export default class ForgotPassword extends React.Component<
	ForgotPasswordScreenProps,
	States
> {
	private formikRef: React.RefObject<FormikProps<FormModel>>;
	constructor(props: ForgotPasswordScreenProps) {
		super(props);

		this.state = {
			email: "",
			accessToken: undefined,
			validationFailedMsg: null,
			isPasswordFormOpen: false,
			visiblePassword: false,
			isOtpModalOpen: false,
			showLoader: false,
		};

		this.formikRef = React.createRef();
	}

	setEmail = (str: string) => {
		this.setState({ email: str.trim().toLowerCase() }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue(
					"email",
					str.trim().toLowerCase()
				);
		});
	};

	gotoSignIn = () => {
		this.props.navigation.pop(1);
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onVerifyAccount = (values: any) => {
		this.verifyAccount();
	};

	onResendOTP = () => {
		this.verifyAccount();
	};

	verifyAccount = () => {
		this.setState({ showLoader: true, validationFailedMsg: null }, () => {
			verifyAccount({
				email: this.state.email,
				purpose: Constant.OTP_PURPOSE_FORGOT_PASSWORD,
				source: Constant.OTP_SOURCE,
			})
				.then((response) => {
					if (response.check === true) {
						this.setState({
							showLoader: false,
							isOtpModalOpen: true,
						});
					} else {
						this.setState({
							validationFailedMsg: response.message,
							showLoader: false,
						});
					}
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	onVerifyOTP = (code: any) => {
		this.setState({ showLoader: true }, () => {
			const reqData = {
				email: this.state.email.trim().toLowerCase(),
				otp: Number(code),
				purpose: Constant.OTP_PURPOSE_FORGOT_PASSWORD,
			};

			verifyOTP(reqData)
				.then((response) => {
					if (response.check === true) {
						const data = response.data;
						this.setState({
							showLoader: false,
							isOtpModalOpen: false,
							isPasswordFormOpen: true,
							accessToken: data.accessToken,
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
		});
	};

	toggleVisiblePassword = () => {
		this.setState({ visiblePassword: !this.state.visiblePassword });
	};

	onUpdatePassword = (values: any) => {
		const { accessToken } = this.state;
		this.setState({ showLoader: true }, () => {
			resetPassword(values.password, accessToken as string)
				.then((response) => {
					this.setState({ showLoader: false }, () => {
						if (response.check === true) {
							Alert.alert(
								LocalizedText.PASSWORD_SUCCESS_TITLE,
								LocalizedText.PASSWORD_SUCCESS,
								[{ text: LocalizedText.OK, onPress: this.gotoSignIn }]
							);
						} else {
							Alert.alert(LocalizedText.FAILED, response.message);
						}
					});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	render = () => (
		<View style={styles.container}>
			<View style={styles.header} />
			<View style={styles.signupContainer}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{this.state.isPasswordFormOpen ? (
						<>
							<Text style={styles.title}>{LocalizedText.RESET_PASSWORD}</Text>
							<Text style={styles.subHeading}>
								{LocalizedText.RESET_PASSWORD_TITLE}
							</Text>

							<Formik
								initialValues={{ password: "", confirmPassword: "" }}
								validationSchema={resetPasswordSchema}
								onSubmit={this.onUpdatePassword}
								enableReinitialize={true}
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
										<View style={{ width: "100%" }}>
											<InputField
												secureTextEntry={!this.state.visiblePassword}
												value={values.password}
												label={LocalizedText.NEW_PASSWORD}
												autoCapitalize="none"
												onChangeText={handleChange("password")}
												onBlur={handleBlur("password")}
												error={touched.password ? errors.password : null}
											/>
											<TouchableOpacity
												style={[
													styles.eyeBtn,
													touched.password && errors.password
														? { bottom: 20 }
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
											label={LocalizedText.CONFIRM_NEW_PASSWORD}
											autoCapitalize="none"
											onChangeText={handleChange("confirmPassword")}
											onBlur={handleBlur("confirmPassword")}
											error={
												touched.confirmPassword ? errors.confirmPassword : null
											}
										/>

										<Button
											title={LocalizedText.UPDATE_PASSWORD}
											style={{ marginTop: 30 }}
											onPress={this.onHandleValidation.bind(this, handleSubmit)}
										/>
									</>
								)}
							</Formik>
						</>
					) : (
						<>
							<Text style={styles.title}>{"Forgot your password?"}</Text>
							<Text style={styles.subHeading}>
								{"Enter your register email to reset your password"}
							</Text>

							<Formik
								innerRef={this.formikRef}
								initialValues={{ email: "" }}
								validationSchema={verifyAccountSchema}
								onSubmit={this.onVerifyAccount}
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
											value={values.email}
											label={"Email"}
											autoCapitalize="none"
											onChangeText={this.setEmail}
											onBlur={handleBlur("email")}
											error={
												touched.email
													? errors.email
													: this.state.validationFailedMsg
													? this.state.validationFailedMsg
													: null
											}
										/>

										<Button
											title={"Verify Account"}
											style={{ marginTop: 30 }}
											onPress={this.onHandleValidation.bind(this, handleSubmit)}
										/>
									</>
								)}
							</Formik>

							<View style={styles.signupTextContainer}>
								<Text style={styles.signupText}>{"Remember password?"}</Text>
								<TouchableOpacity
									onPress={this.gotoSignIn}
									style={{ padding: 5 }}
								>
									<Text style={styles.signupBoldText}>{"Sign In"}</Text>
								</TouchableOpacity>
							</View>
						</>
					)}
				</ScrollView>
			</View>

			<OtpInputModal
				isVisible={this.state.isOtpModalOpen}
				email={this.state.email}
				onResend={this.onResendOTP}
				onSubmit={this.onVerifyOTP}
			/>

			<OverlayLoader visible={this.state.showLoader} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: winHeight,
		width: winWidth,
		backgroundColor: Colors.white,
	},
	header: {
		width: winWidth,
		height: Math.floor((winHeight * 12) / 100),
		backgroundColor: "transparent",
	},
	signupContainer: {
		padding: 20,
		flex: 1,
		backgroundColor: "transparent",
	},
	title: {
		fontSize: 27,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 40,
	},
	subHeading: {
		fontSize: 14,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.6,
		lineHeight: 19,
		marginBottom: 20,
	},
	signupTextContainer: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
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
		bottom: 18,
		padding: 8,
	},
});
