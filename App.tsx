import React, { useEffect, useState } from "react";
import { Linking, StyleSheet, Platform, View, Text, Alert } from "react-native";
import SplashScreen from "react-native-splash-screen";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AndroidOpenSettings from "react-native-android-open-settings";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faWifiSlash } from "@fortawesome/pro-regular-svg-icons/faWifiSlash";
import Snackbar from "react-native-snackbar";
import {
	SafeAreaProvider,
	initialWindowMetrics,
} from "react-native-safe-area-context";
import { getVersion } from "react-native-device-info";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import messaging from "@react-native-firebase/messaging";
import notifee from "@notifee/react-native";
import Navigation from "./src/navigation/Navigation";
import GlobalState from "./src/context/GlobalState";
import { axiosPrivate, axiosPublic } from "./src/axios/Axios";
import Colors from "./src/configs/Colors";
import {
	AppIntro,
	AppUpdateModal,
	Button,
	CustomStatusBar,
	Loader,
} from "./src/components";
import { getCustomerData, getAppVersion } from "./src/services/ApiService";
import {
	getAppIntroStatus,
	disableAppIntro,
	getAccessToken,
	saveAccessToken,
	removeAccessToken,
	getLanguageCode,
	saveLanguageCode,
	displayNotification,
	saveRefreshToken,
	getBiometricValue,
} from "./src/utils/Util";
import LocalizedText from "./src/resources/LocalizedText";
import { iosVersion } from "./app.json";
import { UserDataModel } from "./src/context/AppContext";
import Constant from "./src/configs/Constant";
import { WishlistProvider } from "./src/context/WishlistContext";
import AuthService from "./src/services/AuthService";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	alignCenter: {
		alignItems: "center",
		justifyContent: "center",
	},
	description: {
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "Poppins-Medium",
		color: Colors.secondaryFont,
		lineHeight: 23,
		opacity: 0.7,
		textAlign: "center",
	},
	btn: {
		height: 35,
		width: 100,
		backgroundColor: Colors.white,
		borderWidth: 1,
		borderColor: Colors.primaryBtn,
	},
});

const App: React.FC<any> = (props) => {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [isIntroEnable, setIntroEnable] = useState<boolean>(true);
	const [isOnline, setOnline] = useState<boolean>(false);
	const [isAppUpdateModalOpen, setAppUpdateModalOpen] =
		useState<boolean>(false);
	const [storeUrl, setStoreUrl] = useState<null | string>(null);
	const [latestVersion, setLatestVersion] = useState<null | string>(null);
	const [isBiometricPromptOpen, setBiometricPromptOpen] =
		useState<boolean>(false);
	const [isInitializeCustomer, setInitializeCustomer] =
		useState<boolean>(false);
	const [userData, setUserData] = useState<null | UserDataModel>(null);

	const onShowSnackbar = (message: string) => {
		setTimeout(() => {
			Snackbar.show({
				text: message,
				duration: 6000,
				backgroundColor: "#E63946",
				textColor: Colors.white,
				fontFamily: "Roboto-Regular",
				numberOfLines: 3,
				action: {
					text: "Close",
					textColor: "#FFD60A",
					onPress: onDismisSnackBar,
				},
			});
		}, 350);
	};

	const onDismisSnackBar = () => Snackbar.dismiss();

	useEffect(() => {
		const publicRequestInterceptor = axiosPublic.interceptors.request.use(
			(config) => {
				config.headers["X-Client-Key"] = Constant.CLIENT_KEY;
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		const publicResponseInterceptor = axiosPublic.interceptors.response.use(
			(response) => {
				return response;
			},
			(error) => {
				onShowSnackbar(error.response.data.message);
				return Promise.reject(error);
			}
		);

		return () => {
			axiosPublic.interceptors.response.eject(publicRequestInterceptor);
			axiosPublic.interceptors.response.eject(publicResponseInterceptor);
		};
	}, []);

	useEffect(() => {
		const privateRequestInterceptor = axiosPrivate.interceptors.response.use(
			(resposne) => {
				return resposne;
			},
			async (error) => {
				if (error.response.status === 403) {
					try {
						const result: any = await AuthService.refreshToken();
						const accessToken: string = result.accessToken;
						const refreshToken: string = result.refreshToken;
						await saveAccessToken(accessToken);
						await saveRefreshToken(refreshToken);

						const prevRequest: any = error.config;
						prevRequest.sent = true;
						prevRequest.headers["Authorization"] = `Bearer ${accessToken}`;
						return axiosPrivate(prevRequest);
					} catch {
						onShowSnackbar("Failed to get Refresh Token");
					}
				} else {
					onShowSnackbar(error.response.data.message);
					return Promise.reject(error);
				}
			}
		);

		return () => {
			axiosPrivate.interceptors.response.eject(privateRequestInterceptor);
		};
	}, []);

	useEffect(() => {
		messaging().onMessage(async (message: any) => {
			await displayNotification(
				message.notification.title,
				message.notification.body,
				message.data
			);
		});
	}, []);

	useEffect(() => {
		notifee.registerForegroundService((notification) => {
			return new Promise(() => {});
		});
	}, []);

	// useEffect(() => {
	// 	if (!isLoading) {
	// 		SplashScreen.hide();
	// 	}
	// }, [isLoading]);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener(onHandleConnection);
		return () => {
			unsubscribe();
		};
	}, []);

	const onHandleConnection = (state: NetInfoState): void => {
		if (state.isConnected === null || state.isInternetReachable === null) {
			setLoading(true);
		} else {
			const isConnected: boolean = state.isConnected;
			const isInternetReachable: boolean = state.isInternetReachable;
			if (isConnected && isInternetReachable) {
				setOnline(true);
			} else {
				setOnline(false);
				setLoading(false);
				SplashScreen.hide();
			}
		}
	};

	useEffect(() => {
		if (isOnline) {
			const storedVersion: string =
				Platform.OS === "android" ? getVersion() : iosVersion;
			Promise.all([
				getAppIntroStatus(),
				getAccessToken(),
				getLanguageCode(),
				getBiometricValue(),
				getAppVersion(Constant.APP_NAME, Platform.OS, storedVersion),
			])
				.then(async (result) => {
					const introStatus: null | string = result[0];
					const token: null | string = result[1];
					const languageCode: null | string = result[2];
					const biomtericValue: null | string = result[3];
					const appData: any = result[4];
					const appInfo: any = appData.data;
					setIntroEnable(introStatus === null);
					setLatestVersion(appInfo.latestVersion);
					setStoreUrl(appInfo.storeUrl);
					setAppUpdateModalOpen(appInfo.isDiscontinued === true);

					const rnBiometrics = new ReactNativeBiometrics();
					try {
						const { available, biometryType } =
							await rnBiometrics.isSensorAvailable();
						if (available) {
							if (biomtericValue !== null && biomtericValue === "YES") {
								if (token !== null) {
									setBiometricPromptOpen(true);
									setLoading(false);
									SplashScreen.hide();

									if (Platform.OS === "android") {
										/* biometric for Android */
										if (biometryType === BiometryTypes.Biometrics) {
											const result = await rnBiometrics.simplePrompt({
												promptMessage: "Sign in quickly using your fingerprint",
												cancelButtonText: "Cancel",
											});
											if (result.success) {
												setInitializeCustomer(true);
											} else {
												setInitializeCustomer(false);
												setBiometricPromptOpen(false);
												setUserData(null);
												removeAccessToken();
											}
										}
									} else {
										/* biometric for iOS (Face ID) */
										if (biometryType === BiometryTypes.FaceID) {
											const result = await rnBiometrics.simplePrompt({
												promptMessage: "Sign in quickly using your Face ID",
												cancelButtonText: "Cancel",
											});
											if (result.success) {
												setInitializeCustomer(true);
											} else {
												setInitializeCustomer(false);
												setBiometricPromptOpen(false);
												setUserData(null);
												removeAccessToken();
											}
										}

										/* biometric for iOS (Touch ID) */
										if (biometryType === BiometryTypes.TouchID) {
											const result = await rnBiometrics.simplePrompt({
												promptMessage: "Sign in quickly using your Touch ID",
												cancelButtonText: "Cancel",
											});
											if (result.success) {
												setInitializeCustomer(true);
											} else {
												setInitializeCustomer(false);
												setBiometricPromptOpen(false);
												setUserData(null);
												removeAccessToken();
											}
										}
									}
								} else {
									if (languageCode === null) {
										LocalizedText.setLanguage(Constant.DEFAULT_LANGUAGE_CODE);
										saveLanguageCode(Constant.DEFAULT_LANGUAGE_CODE);
									} else {
										LocalizedText.setLanguage(languageCode);
									}

									setInitializeCustomer(false);
									setBiometricPromptOpen(false);
									setLoading(false);
									SplashScreen.hide();
								}
							} else {
								if (token !== null) {
									setBiometricPromptOpen(false);
									setInitializeCustomer(true);
								} else {
									setBiometricPromptOpen(false);
									setInitializeCustomer(false);
									setLoading(false);

									if (languageCode === null) {
										LocalizedText.setLanguage(Constant.DEFAULT_LANGUAGE_CODE);
										saveLanguageCode(Constant.DEFAULT_LANGUAGE_CODE);
									} else {
										LocalizedText.setLanguage(languageCode);
									}
									SplashScreen.hide();
								}
							}
						} else {
							/* No biometric sensors available */
							if (token !== null) {
								setBiometricPromptOpen(false);
								setInitializeCustomer(true);
							} else {
								setBiometricPromptOpen(false);
								setInitializeCustomer(false);
								setLoading(false);

								if (languageCode === null) {
									LocalizedText.setLanguage(Constant.DEFAULT_LANGUAGE_CODE);
									saveLanguageCode(Constant.DEFAULT_LANGUAGE_CODE);
								} else {
									LocalizedText.setLanguage(languageCode);
								}
								SplashScreen.hide();
							}
						}
					} catch (error) {
						if (languageCode === null) {
							LocalizedText.setLanguage(Constant.DEFAULT_LANGUAGE_CODE);
							saveLanguageCode(Constant.DEFAULT_LANGUAGE_CODE);
						} else {
							LocalizedText.setLanguage(languageCode);
						}

						SplashScreen.hide();
						setBiometricPromptOpen(false);
						setLoading(false);
					}
				})
				.catch((error) => {
					setBiometricPromptOpen(false);
					setInitializeCustomer(false);
					setAppUpdateModalOpen(false);
					setLoading(false);
				});
		}
	}, [isOnline]);

	useEffect(() => {
		if (isInitializeCustomer) {
			getCustomerData()
				.then((response: any) => {
					const customer: any = response.data;
					const accessToken: string = customer.accessToken;
					const refreshToken: string = customer.refreshToken;

					delete customer.accessToken;
					delete customer.refreshToken;

					LocalizedText.setLanguage(customer.default_language.code);
					saveAccessToken(accessToken);
					saveRefreshToken(refreshToken);
					saveLanguageCode(customer.default_language.code);
					setUserData(customer);
					setLoading(false);
					setInitializeCustomer(false);
					setBiometricPromptOpen(false);
					SplashScreen.hide();
				})
				.catch((error) => {
					LocalizedText.setLanguage(Constant.DEFAULT_LANGUAGE_CODE);
					removeAccessToken();
					setUserData(null);
					setInitializeCustomer(false);
					setBiometricPromptOpen(false);
					setLoading(false);
				});
		}
	}, [isInitializeCustomer]);

	const openSettingApp = () => {
		if (Platform.OS === "android") {
			AndroidOpenSettings.generalSettings();
		} else {
			Linking.openURL("app-settings:");
		}
	};

	const onDone = () => {
		disableAppIntro();
		setIntroEnable(false);
	};

	const onUpdate = () => {
		if (storeUrl !== null) {
			Linking.canOpenURL(storeUrl)
				.then((isSupported) => {
					if (isSupported) {
						Linking.openURL(storeUrl);
					}
				})
				.catch((error) => {});
		} else {
			setAppUpdateModalOpen(false);
		}
	};

	if (isLoading) {
		return null;
	} else if (!isOnline) {
		return (
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<CustomStatusBar
					barStyle="dark-content"
					backgroundColor={Colors.statusBar}
				/>
				<View
					style={[
						styles.container,
						styles.alignCenter,
						{ backgroundColor: Colors.white },
					]}
				>
					<FontAwesomeIcon
						icon={faWifiSlash}
						size={50}
						color={Colors.secondary}
					/>
					<View style={{ marginVertical: 20 }}>
						<Text style={styles.description}>
							{"Oops, looks like there is no \n internet connection"}
						</Text>
					</View>

					<Button
						title={"Retry"}
						style={styles.btn}
						titleStyle={{ color: Colors.primaryBtn }}
						onPress={openSettingApp}
					/>
				</View>
			</SafeAreaProvider>
		);
	} else if (isIntroEnable) {
		return (
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<CustomStatusBar
					barStyle="dark-content"
					backgroundColor={Colors.statusBar}
				/>
				<AppIntro onDone={onDone} />
			</SafeAreaProvider>
		);
	} else if (isBiometricPromptOpen) {
		return (
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				{isInitializeCustomer ? <Loader /> : null}
			</SafeAreaProvider>
		);
	} else {
		return (
			<SafeAreaProvider initialMetrics={initialWindowMetrics}>
				<GlobalState userData={userData}>
					<WishlistProvider>
						{isAppUpdateModalOpen ? null : <Navigation />}
						<AppUpdateModal
							isVisible={isAppUpdateModalOpen}
							latestVersion={latestVersion}
							onUpdate={onUpdate}
						/>
					</WishlistProvider>
				</GlobalState>
			</SafeAreaProvider>
		);
	}
};

export default App;
