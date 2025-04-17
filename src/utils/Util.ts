import { Platform, Alert } from "react-native";
import { check, PERMISSIONS, RESULTS, request } from "react-native-permissions";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment-timezone";
import notifee, { AndroidImportance } from "@notifee/react-native";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import * as Keychain from "react-native-keychain";

const APP_INTRO_STATUS_STORAGE_KEY = "@tourish_app_intro_status";
const APP_LANGUAGE_CODE_STORAGE_KEY = "@tourish_app_language_code";
const ACCESS_TOKEN_KEY = "tourish_app_user_token";
const REFRESH_TOKEN_KEY = "tourish_app_user_refresh_token";
const ACCESS_TOKEN_SERVICE = "accessTokenService";
const REFRESH_TOKEN_SERVICE = "refreshTokenService";
const APP_BIOMETRIC_ENABLED_KEY = "@tourish_app_biometric_key";

/**
 * @Desc: Get Access Token
 */
export const getAppIntroStatus = async () => {
	try {
		const status = await AsyncStorage.getItem(APP_INTRO_STATUS_STORAGE_KEY);
		return status;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Disable App Intro
 */
export const disableAppIntro = async () => {
	try {
		await AsyncStorage.setItem(APP_INTRO_STATUS_STORAGE_KEY, "Y");
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Get Language Code
 */
export const getLanguageCode = async () => {
	try {
		const code = await AsyncStorage.getItem(APP_LANGUAGE_CODE_STORAGE_KEY);
		return code;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Save Language Code
 */
export const saveLanguageCode = async (code: string) => {
	try {
		await AsyncStorage.setItem(APP_LANGUAGE_CODE_STORAGE_KEY, code);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Remove Language Code
 */
export const removeLanguageCode = async () => {
	try {
		await AsyncStorage.removeItem(APP_LANGUAGE_CODE_STORAGE_KEY);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Get Biometric Value
 */
export const getBiometricValue = async () => {
	try {
		const value = await AsyncStorage.getItem(APP_BIOMETRIC_ENABLED_KEY);
		return value;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Save Biometric Value
 */
export const saveBiometricValue = async (value: string) => {
	try {
		await AsyncStorage.setItem(APP_BIOMETRIC_ENABLED_KEY, value);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

/**
 * @Desc: Remove Biometric Value
 */
export const removeBiometricValue = async () => {
	try {
		await AsyncStorage.removeItem(APP_BIOMETRIC_ENABLED_KEY);
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Save Access Token
export const saveAccessToken = async (token: string) => {
	try {
		await Keychain.setGenericPassword(ACCESS_TOKEN_KEY, token, {
			service: ACCESS_TOKEN_SERVICE,
		});
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Get Access Token
export const getAccessToken = async () => {
	try {
		const credentials = await Keychain.getGenericPassword({
			service: ACCESS_TOKEN_SERVICE,
		});
		if (credentials && credentials.username === ACCESS_TOKEN_KEY) {
			return credentials.password;
		}
		return null;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Remove Access Token
export const removeAccessToken = async () => {
	try {
		const credentials = await Keychain.getGenericPassword({
			service: ACCESS_TOKEN_SERVICE,
		});
		if (credentials && credentials.username === ACCESS_TOKEN_KEY) {
			await Keychain.resetGenericPassword({ service: ACCESS_TOKEN_SERVICE });
		}
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Save Refresh Token
export const saveRefreshToken = async (token: string) => {
	try {
		await Keychain.setGenericPassword(REFRESH_TOKEN_KEY, token, {
			service: REFRESH_TOKEN_SERVICE,
		});
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Get Refresh Token
export const getRefreshToken = async () => {
	try {
		const credentials = await Keychain.getGenericPassword({
			service: REFRESH_TOKEN_SERVICE,
		});
		if (credentials && credentials.username === REFRESH_TOKEN_KEY) {
			return credentials.password;
		}
		return null;
	} catch (error: any) {
		throw new Error(error.message);
	}
};

// Remove Refresh Token
export const removeRefreshToken = async () => {
	try {
		const credentials = await Keychain.getGenericPassword({
			service: REFRESH_TOKEN_SERVICE,
		});
		if (credentials && credentials.username === REFRESH_TOKEN_KEY) {
			await Keychain.resetGenericPassword({ service: REFRESH_TOKEN_SERVICE });
		}
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export const getFlightDelay = (delay: any) => {
	if (delay !== null) {
		delay = parseInt(delay);

		if (delay > 60) {
			let hours = Math.floor(delay / 60);
			let str = hours === 1 ? `${hours} hour` : `${hours} hours`;

			let minutes = delay - hours * 60;
			str += minutes === 1 ? ` ${minutes} min` : ` ${minutes} mins`;
			return str;
		}

		return delay === 1 ? `${delay} min` : `${delay} mins`;
	}

	return null;
};

export const getWindDirection = (windDeg: number) => {
	var val = Math.floor(windDeg / 22.5 + 0.5);
	var arr = [
		"N",
		"NNE",
		"NE",
		"ENE",
		"E",
		"ESE",
		"SE",
		"SSE",
		"S",
		"SSW",
		"SW",
		"WSW",
		"W",
		"WNW",
		"NW",
		"NNW",
	];
	return arr[val % 16];
};

export const calculateSun = (time: number, timeZone: string) => {
	var dt = new Date(time * 1000);
	return moment(dt).tz(timeZone).format("hh:mm A");
};

export const getAxoisRequestHeaders = async (
	reqMethod = Constant.GET_REQUEST,
	isFormData = false
) => {
	const token = await getAccessToken();
	let headers = null;

	if (reqMethod === Constant.GET_REQUEST) {
		headers = {
			Authorization: `Bearer ${token}`,
		};
	} else {
		headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": isFormData
				? Constant.CONTENT_TYPE_FORMDATA
				: Constant.CONTENT_TYPE_JSON,
		};
	}

	return headers;
};

/**
 * @Desc: Request image gallery permission to user
 */
export const requestImageGalleryPermission = async (callback: Function) => {
	const status =
		Platform.OS === "android"
			? await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
			: await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

	if (status === RESULTS.GRANTED) {
		callback();
	} else {
		const status2 =
			Platform.OS === "android"
				? await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
				: await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

		if (status2 == RESULTS.GRANTED || RESULTS.LIMITED) {
			callback();
		} else {
			Alert.alert("Error", "Storage permission is not granted");
		}
	}
};

/**
 * @Desc: Request storage permission from user
 */
export const requestStoragePermission = async (callback: Function) => {
	const status =
		Platform.OS === "android"
			? await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
			: await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

	if (status === RESULTS.GRANTED) {
		callback();
	} else {
		const status2 =
			Platform.OS === "android"
				? await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
				: await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

		if (status2 == RESULTS.GRANTED || RESULTS.LIMITED) {
			callback();
		} else {
			Alert.alert("Error", "Storage permission is not granted");
		}
	}
};

/**
 * @Desc: Request camera permission to user
 */
export const requestCameraPermission = async (callback: Function) => {
	const status =
		Platform.OS === "android"
			? await check(PERMISSIONS.ANDROID.CAMERA)
			: await check(PERMISSIONS.IOS.CAMERA);

	if (status === RESULTS.GRANTED) {
		callback();
	} else {
		const status2 =
			Platform.OS === "android"
				? await request(PERMISSIONS.ANDROID.CAMERA)
				: await request(PERMISSIONS.IOS.CAMERA);

		if (status2 == RESULTS.GRANTED || RESULTS.LIMITED) {
			callback();
		} else {
			Alert.alert("Error", "Camera permission is not granted");
		}
	}
};

/**
 * @Desc: Request notification permission to user
 */
export const requestNotificationPermission = async (callback: Function) => {
	if (Platform.OS === "android") {
		const status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
		if (status === RESULTS.GRANTED) {
			callback();
		} else {
			const status2 = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
			if (status2 == RESULTS.GRANTED || RESULTS.LIMITED) {
				callback();
			} else {
				Alert.alert("Error", "Notification permission is not granted");
			}
		}
	} else {
		const reqStatus = await messaging().requestPermission({
			alert: true,
			badge: true,
			carPlay: true,
			sound: true,
		});

		if (reqStatus === messaging.AuthorizationStatus.AUTHORIZED) {
			callback();
		} else if (reqStatus === messaging.AuthorizationStatus.PROVISIONAL) {
			callback();
		} else {
			Alert.alert("Error", "Notification permission is not granted");
		}
	}
};

/**
 * @Desc: Check a string is empty or not
 */
export const isEmptyString = (str: any): boolean => {
	if (typeof str === "string") {
		const regx = /^\s*$/;
		return regx.test(str);
	} else {
		return true;
	}
};

export const debounce = (func: Function, timeout = 300) => {
	let timer: any;
	return (...args: any) => {
		if (typeof timer !== "undefined") {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
};

/**
 * @Desc: Get Language name by code
 */
export const getLanguageNameByCode = (code: string): string => {
	const index: number = Constant.AVAILABLE_LANGUAGES.findIndex(
		(item: any) => item.code === code
	);
	if (index > -1) {
		const language: any = Constant.AVAILABLE_LANGUAGES[index];
		return language.name;
	} else {
		return Constant.DEFAULT_LANGUAGE_NAME;
	}
};

/**
 * @Desc: Get First Letter Of Each Word In Capital Of a Sentence
 */
export const toUpperCaseWord = (str: string): string => {
	const words = str.trim().toLocaleLowerCase().split(" ");
	for (let i = 0; i < words.length; i++) {
		words[i] = words[i][0].toUpperCase() + words[i].substring(1);
	}
	return words.join(" ");
};

export const IN_APP_BROWSER_OPTIONS = {
	// iOS Properties
	dismissButtonStyle: "cancel",
	preferredBarTintColor: Colors.white,
	preferredControlTintColor: Colors.primaryBtn,
	readerMode: false,
	animated: true,
	modalPresentationStyle: "fullScreen",
	modalTransitionStyle: "coverVertical",
	modalEnabled: true,
	enableBarCollapsing: false,
	// Android Properties
	showTitle: true,
	toolbarColor: Colors.white,
	secondaryToolbarColor: Colors.white,
	navigationBarColor: Colors.white,
	navigationBarDividerColor: Colors.white,
	enableUrlBarHiding: true,
	enableDefaultShare: true,
	forceCloseOnRedirection: false,
};

export const displayNotification = async (
	title: string,
	body: string,
	data: any
) => {
	const androidNotificationChannelId = await notifee.createChannel({
		id: "default",
		name: "Default Channel",
		sound: "default",
		lights: true,
		vibration: true,
		vibrationPattern: [300, 500],
		importance: AndroidImportance.HIGH,
	});

	await notifee.displayNotification({
		title: title,
		body: body,
		data: data,
		android: {
			channelId: androidNotificationChannelId,
			smallIcon: "ic_stat_icon",
			color: Colors.secondary,
			importance: AndroidImportance.HIGH,
		},
	});
};

export const getEsimQrImageUrl = (qr: string): string => {
	const start: number = qr.indexOf("<svg");
	const end: number = qr.indexOf("</svg>") + 6;
	return `data:image/svg+xml;utf8,${qr.substring(start, end)}`;
};
