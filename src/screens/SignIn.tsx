import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
	Platform,
	TouchableHighlight,
} from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import auth from "@react-native-firebase/auth";
import DeviceCountry, { TYPE_TELEPHONY } from "react-native-device-country";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { appleAuth } from "@invertase/react-native-apple-authentication";
import ReactNativeBiometrics from "react-native-biometrics";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye } from "@fortawesome/pro-light-svg-icons/faEye";
import { faEyeSlash } from "@fortawesome/pro-light-svg-icons/faEyeSlash";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons/faArrowLeft";
import messaging from "@react-native-firebase/messaging";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { Container, Button, OverlayLoader } from "../components";
import {
	validateGoogleAuthentication,
	validateAppleAuthentication,
} from "../services/ApiService";
import {
	saveAccessToken,
	isEmptyString,
	saveLanguageCode,
	requestNotificationPermission,
	saveRefreshToken,
	saveBiometricValue,
} from "../utils/Util";
import { SignInScreenProps } from "../navigation/NavigationTypes";
import LocalizedText from "../resources/LocalizedText";
import AuthService from "../services/AuthService";
import AppContext from "../context/AppContext";
import InputField from "../components/InputField";

const signInSchema = Yup.object().shape({
	email: Yup.string()
		.required("Enter your email")
		.matches(/^[a-z][0-9a-z]/i, "Enter your email")
		.matches(/^\S*$/, "Enter your email")
		.matches(
			/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			"Enter your email"
		),
	password: Yup.string().required("Enter your password"),
});

type FormModel = {
	email: string;
	password: string;
};

type States = {
	visiblePassword: boolean;
	isValidationFailed: boolean;
	showLoader: boolean;
};

export default class Login extends React.Component<SignInScreenProps, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: any) {
		super(props);

		this.state = {
			visiblePassword: false,
			isValidationFailed: false,
			showLoader: false,
		};

		this.formikRef = React.createRef();

		GoogleSignin.configure({
			scopes: Constant.GOOGLE_SIGN_IN_SCOPE,
			webClientId: Constant.GOOGLE_SIGN_IN_WEBCLIENT_ID,
		});
	}

	checkNotificationPermission = async () => {
		if (Platform.OS === "android") {
			return true;
		} else {
			const reqStatus = await messaging().requestPermission();
			const isEnabled =
				reqStatus === messaging.AuthorizationStatus.AUTHORIZED ||
				reqStatus === messaging.AuthorizationStatus.PROVISIONAL;
			return isEnabled;
		}
	};

	validateGoogleLogin = (
		uid: string,
		email: string,
		name: string,
		deviceToken: string
	) => {
		this.setState({ showLoader: true }, () => {
			Promise.all([
				auth().signOut(),
				DeviceCountry.getCountryCode(TYPE_TELEPHONY),
			])
				.then((resResult: any[]) => {
					const countryResult: any = resResult[1];
					const reqData: any = {
						countryCode: countryResult.code.toUpperCase(),
						firebaseUID: uid,
						email: email,
						name: name,
						deviceToken: deviceToken,
					};

					validateGoogleAuthentication(reqData)
						.then((response) => {
							this.setState({ showLoader: false }, async () => {
								const userData = response.data;
								const accessToken: string = userData.accessToken;
								const refreshToken: string = userData.refreshToken;

								delete userData.accessToken;
								delete userData.refreshToken;
								LocalizedText.setLanguage(userData.default_language.code);
								saveLanguageCode(userData.default_language.code);
								saveAccessToken(accessToken);
								saveRefreshToken(refreshToken);
								this.context.setUserData(userData);

								const rnBiometrics = new ReactNativeBiometrics();
								const { available } = await rnBiometrics.isSensorAvailable();

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
								// 	this.props.navigation.pop(1);
								// }, 350);
							});
						})
						.catch((error) => {
							this.setState({ showLoader: false });
						});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	validateAppleLogin = (
		uid: string,
		deviceToken: string,
		email: null | string,
		name: null | string
	) => {
		this.setState({ showLoader: true }, () => {
			Promise.all([
				auth().signOut(),
				DeviceCountry.getCountryCode(TYPE_TELEPHONY),
			])
				.then((resResult: any[]) => {
					const countryResult: any = resResult[1];
					const reqData: any = {
						countryCode: countryResult.code.toUpperCase(),
						firebaseUID: uid,
						deviceToken,
					};

					if (email !== null) {
						reqData.email = email;
					}
					if (name !== null) {
						reqData.name = name;
					}

					validateAppleAuthentication(reqData)
						.then((response) => {
							this.setState({ showLoader: false }, async () => {
								const userData = response.data;
								const accessToken: string = userData.accessToken;
								const refreshToken: string = userData.refreshToken;

								delete userData.accessToken;
								delete userData.refreshToken;
								LocalizedText.setLanguage(userData.default_language.code);
								saveLanguageCode(userData.default_language.code);
								saveAccessToken(accessToken);
								saveRefreshToken(refreshToken);
								this.context.setUserData(userData);

								const rnBiometrics = new ReactNativeBiometrics();
								const { available } = await rnBiometrics.isSensorAvailable();

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
								// 	this.props.navigation.pop(1);
								// }, 350);
							});
						})
						.catch((error) => {
							this.setState({ showLoader: false });
						});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	toggleVisiblePassword = () => {
		this.setState({ visiblePassword: !this.state.visiblePassword });
	};

	onGoogleButtonPress = () => {
		requestNotificationPermission(async () => {
			try {
				await messaging().registerDeviceForRemoteMessages();
				const deviceToken = await messaging().getToken();

				await GoogleSignin.hasPlayServices({
					showPlayServicesUpdateDialog: true,
				});
				await GoogleSignin.signOut();
				const { idToken } = await GoogleSignin.signIn();
				const googleCredential = auth.GoogleAuthProvider.credential(idToken);
				const { user }: any = await auth().signInWithCredential(
					googleCredential
				);
				this.validateGoogleLogin(
					user.uid,
					user.email,
					user.displayName,
					deviceToken
				);
			} catch (error) {
				this.setState({ showLoader: false });
			}
		});
	};

	onAppleButtonPress = () => {
		requestNotificationPermission(async () => {
			try {
				const appleAuthRequestResponse = await appleAuth.performRequest({
					requestedOperation: appleAuth.Operation.LOGIN,
					requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
				});

				const { identityToken, nonce, fullName } = appleAuthRequestResponse;
				if (identityToken) {
					const appleCredential = auth.AppleAuthProvider.credential(
						identityToken,
						nonce
					);
					const { user }: any = await auth().signInWithCredential(
						appleCredential
					);

					let name = "";
					if (fullName?.givenName !== null) {
						name += fullName?.givenName;
					}
					if (fullName?.middleName !== null) {
						name += " " + fullName?.middleName;
					}
					if (fullName?.familyName !== null) {
						name += " " + fullName?.familyName;
					}

					await messaging().registerDeviceForRemoteMessages();
					const deviceToken = await messaging().getToken();
					this.validateAppleLogin(
						user.uid,
						deviceToken,
						user.email,
						isEmptyString(name) ? null : name
					);
				} else {
					throw new Error("Apple Sign-In failed - no identify token returned");
				}
			} catch (error) {}
		});
	};

	gotoSignUp = () => {
		this.props.navigation.navigate("SignUp");
	};

	gotoForgotPassword = () => {
		this.props.navigation.navigate("ForgotPassword");
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = async (values: FormModel) => {
		requestNotificationPermission(async () => {
			await messaging().registerDeviceForRemoteMessages();
			const deviceToken = await messaging().getToken();
			this.setState({ showLoader: true }, () => {
				const reqData = {
					username: values.email,
					password: values.password,
					deviceToken: deviceToken,
				};

				AuthService.signIn(reqData)
					.then((response: any) => {
						this.setState({ showLoader: false }, async () => {
							const userData = response.data;
							const accessToken: string = userData.accessToken;
							const refreshToken: string = userData.refreshToken;
							LocalizedText.setLanguage(userData.default_language.code);

							delete userData.accessToken;
							delete userData.refreshToken;

							saveLanguageCode(userData.default_language.code);
							saveAccessToken(accessToken);
							saveRefreshToken(refreshToken);
							this.context.setUserData(userData);

							const rnBiometrics = new ReactNativeBiometrics();
							const { available } = await rnBiometrics.isSensorAvailable();

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
							// 	this.props.navigation.pop(1);
							// }, 350);
						});
					})
					.catch((error) => {
						this.setState({ showLoader: false });
					});

				/*userLogin(reqData)
					.then((response: any) => {
						this.setState({ showLoader: false }, async () => {
							if (response.check === true) {
								const userData = response.data;
								const token = userData.token;
								LocalizedText.setLanguage(userData.default_language.code);

								
								saveLanguageCode(userData.default_language.code);
								saveAccessToken(token);
								this.context.setUserData(userData);

								// await this.saveCredentialsToKeychain(
								// 	values.email,
								// 	values.password
								// );
								setTimeout(() => {
									this.props.navigation.pop(1);
								}, 350);
							} else {
								Alert.alert("Error", response.message);
							}
						});
					})
					.catch((error) => {
						this.setState({ showLoader: false });
					});*/
			});
		});
	};

	gotoBack = () => {
		this.props.navigation.pop(1);
	};

	onChangeEmail = (str: string) => {
		const value: string = str.trim().toLowerCase();
		this.formikRef && this.formikRef.current?.setFieldValue("email", value);
	};

	render = () => (
		<Container
			style={{ backgroundColor: Colors.white }}
			statusBarColor={Colors.white}
		>
			{this.props.navigation.canGoBack() ? (
				<TouchableHighlight
					underlayColor={Colors.lightGrey}
					style={styles.backBtn}
					onPress={this.gotoBack}
				>
					<FontAwesomeIcon
						icon={faArrowLeft}
						size={25}
						color={Colors.primaryBtn}
					/>
				</TouchableHighlight>
			) : null}
			<View style={styles.loginContainer}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Text style={styles.title}>{"Welcome back"}</Text>
					<Text style={styles.subHeading}>{"Sign in to your account."}</Text>
					<Formik
						initialValues={{
							email: "",
							password: "",
						}}
						validationSchema={signInSchema}
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
									label={"Email"}
									value={values.email}
									keyboardType={"email-address"}
									autoCapitalize="none"
									onChangeText={this.onChangeEmail}
									onBlur={handleBlur("email")}
									error={touched.email ? errors.email : null}
								/>
								<View style={{ width: "100%" }}>
									<InputField
										value={values.password}
										label={"Password"}
										autoCapitalize="none"
										secureTextEntry={!this.state.visiblePassword}
										onChangeText={handleChange("password")}
										onBlur={handleBlur("password")}
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
								<TouchableOpacity
									onPress={this.gotoForgotPassword}
									style={{ alignSelf: "flex-end" }}
								>
									<Text style={styles.forgotPassText}>
										{"Forgot Password?"}
									</Text>
								</TouchableOpacity>
								<Button
									title={"Sign in"}
									style={{ marginTop: 30 }}
									onPress={this.onHandleValidation.bind(this, handleSubmit)}
								/>
							</>
						)}
					</Formik>

					<Text style={styles.orDevider}>OR</Text>

					<TouchableOpacity
						activeOpacity={0.7}
						style={styles.socialBtn}
						onPress={this.onGoogleButtonPress}
					>
						<Image
							resizeMode="cover"
							source={require("../assets/images/google.png")}
							style={styles.socialIcon}
						/>
						<Text style={styles.socialBtnText}>{"Sign in with Google"}</Text>
					</TouchableOpacity>

					{Platform.OS === "ios" ? (
						<TouchableOpacity
							activeOpacity={0.7}
							style={[styles.socialBtn, { marginTop: 15 }]}
							onPress={this.onAppleButtonPress}
						>
							<Image
								resizeMode="cover"
								source={require("../assets/images/apple.png")}
								style={styles.socialIcon}
							/>
							<Text style={styles.socialBtnText}>{"Sign in with Apple"}</Text>
						</TouchableOpacity>
					) : null}

					<View style={styles.signupTextContainer}>
						<Text style={styles.signupText}>{"Don't have an account?"}</Text>
						<TouchableOpacity onPress={this.gotoSignUp} style={{ padding: 5 }}>
							<Text style={styles.signupBoldText}>{"Sign Up"}</Text>
						</TouchableOpacity>
					</View>

					{/* <TouchableOpacity
						activeOpacity={0.7}
						style={styles.socialBtn}
						onPress={this.checkForBiometricCredentials}
					>
						<Image
							resizeMode="cover"
							source={require("../assets/images/google.png")}
							style={styles.socialIcon}
						/>
						<Text style={styles.socialBtnText}>{"Biometric Login"}</Text>
					</TouchableOpacity> */}
				</ScrollView>
			</View>
			<OverlayLoader visible={this.state.showLoader} />
		</Container>
	);
}

const styles = StyleSheet.create({
	loginContainer: {
		flex: 1,
		backgroundColor: Colors.white,
		padding: 20,
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
		lineHeight: 20,
		marginBottom: 10,
	},
	forgotPassText: {
		fontSize: 14,
		color: Colors.secondary,
		lineHeight: 20,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
	},
	eyeBtn: {
		// position: "absolute",
		// right: 0,
		// bottom: 10,
		// padding: 5,
		position: "absolute",
		right: 0,
		bottom: 15,
		padding: 5,
	},
	orDevider: {
		width: "100%",
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 16,
		lineHeight: 26,
		color: Colors.secondaryFont,
		opacity: 0.6,
		marginVertical: 15,
		textAlign: "center",
	},
	socialBtn: {
		width: "100%",
		height: 45,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	socialIcon: {
		position: "absolute",
		top: 8,
		left: 15,
		width: 25,
		height: 25,
	},
	socialBtnText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 0.7,
	},
	signupTextContainer: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 15,
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
	backBtn: {
		width: 35,
		height: 35,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 100,
		margin: 12,
	},
});
