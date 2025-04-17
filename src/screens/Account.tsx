import React, { Fragment, useContext, useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableHighlight,
	Alert,
	ViewStyle,
	BackHandler,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser } from "@fortawesome/pro-solid-svg-icons/faUser";
import { faTrash } from "@fortawesome/pro-solid-svg-icons/faTrash";
import { faAngleRight } from "@fortawesome/pro-regular-svg-icons/faAngleRight";
import { faGavel } from "@fortawesome/pro-solid-svg-icons/faGavel";
import { faArrowRightFromBracket } from "@fortawesome/pro-solid-svg-icons/faArrowRightFromBracket";
import { faArrowRightToBracket } from "@fortawesome/pro-solid-svg-icons/faArrowRightToBracket";
import { faLockKeyhole } from "@fortawesome/pro-solid-svg-icons/faLockKeyhole";
import { faCube } from "@fortawesome/pro-solid-svg-icons/faCube";
import { faLanguage } from "@fortawesome/pro-solid-svg-icons/faLanguage";
import { faFile } from "@fortawesome/pro-solid-svg-icons/faFile";
import { faShieldCheck } from "@fortawesome/pro-solid-svg-icons/faShieldCheck";
import { faSimCard } from "@fortawesome/pro-solid-svg-icons/faSimCard";
import { faFingerprint } from "@fortawesome/pro-solid-svg-icons/faFingerprint";
import ReactNativeBiometrics from "react-native-biometrics";
import {
	Container,
	WhiteContainer,
	Header,
	Language,
	OverlayLoader,
	TermsAndConditions,
	PrivacyPolicy,
	Card,
	Button,
	Switch,
} from "../components";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import {
	getLanguageCode,
	saveLanguageCode,
	removeAccessToken,
	getLanguageNameByCode,
	removeRefreshToken,
	saveBiometricValue,
	getBiometricValue,
} from "../utils/Util";
import { getAllCurrencies, updateProfile } from "../services/ApiService";
import LocalizedText from "../resources/LocalizedText";
import { AccountScreenProps } from "../navigation/NavigationTypes";
import AppContext, { UserDataModel } from "../context/AppContext";
import { faCalendarClock } from "@fortawesome/pro-solid-svg-icons";
import CurrencyPicker from "../components/CurrencyPicker";
import { CommonActions } from "@react-navigation/native";

type MenulistProps = {
	icon: any;
	title: string;
	onPress: () => void;
	type?: string;
	value?: boolean;
	style?: ViewStyle | ViewStyle[];
};

const Menulist: React.FC<MenulistProps> = (props) => (
	<>
		{typeof props.type !== "undefined" &&
		typeof props.value !== "undefined" &&
		props.type === "switch" ? (
			<View style={[styles.userMenuList, props.style]}>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<View style={styles.iconStyle}>
						<FontAwesomeIcon
							size={20}
							icon={props.icon}
							color={Colors.secondaryBtn}
						/>
					</View>
					<Text
						style={{
							marginLeft: 15,
							fontSize: 14,
							fontFamily: "Roboto-Regular",
							fontWeight: "400",
							color: Colors.secondaryFont,
							opacity: 0.8,
						}}
					>
						{props.title}
					</Text>
				</View>
				<Switch
					value={props.value}
					onValueChange={props.onPress}
					style={{ marginRight: 5 }}
				/>
			</View>
		) : (
			<TouchableHighlight
				onPress={props.onPress}
				underlayColor={Colors.lightGrey}
				style={[styles.userMenuList, props.style]}
			>
				<>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<View style={styles.iconStyle}>
							<FontAwesomeIcon
								size={20}
								icon={props.icon}
								color={Colors.secondaryBtn}
							/>
						</View>
						<Text
							style={{
								marginLeft: 15,
								fontSize: 14,
								fontFamily: "Roboto-Regular",
								fontWeight: "400",
								color: Colors.secondaryFont,
								opacity: 0.8,
							}}
						>
							{props.title}
						</Text>
					</View>
					<FontAwesomeIcon
						size={18}
						icon={faAngleRight}
						color={Colors.secondaryBtn}
					/>
				</>
			</TouchableHighlight>
		)}
	</>
);

type MenulistOptionProps = {
	icon: any;
	title: string;
	value: string;
	onPress?: () => void;
	style?: ViewStyle | ViewStyle[];
};

const MenulistOption: React.FC<MenulistOptionProps> = (props) => (
	<TouchableHighlight
		onPress={props.onPress}
		underlayColor={Colors.lightGrey}
		style={[styles.userMenuList, props.style]}
	>
		<>
			<View style={{ flexDirection: "row", alignItems: "center" }}>
				<View style={styles.iconStyle}>
					<FontAwesomeIcon
						size={22}
						icon={props.icon}
						color={Colors.secondaryBtn}
					/>
				</View>
				<Text
					style={{
						marginLeft: 15,
						fontSize: 14,
						fontFamily: "Roboto-Regular",
						fontWeight: "400",
						color: Colors.secondaryFont,
						opacity: 0.8,
					}}
				>
					{props.title}
				</Text>
			</View>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Text
					style={{
						marginLeft: 15,
						fontSize: 14,
						fontFamily: "Roboto-Regular",
						fontWeight: "400",
						color: Colors.secondaryFont,
						opacity: 0.8,
						marginHorizontal: 10,
					}}
				>
					{props.value}
				</Text>
				<FontAwesomeIcon
					size={18}
					icon={faAngleRight}
					color={Colors.secondaryBtn}
				/>
			</View>
		</>
	</TouchableHighlight>
);

const Account: React.FC<AccountScreenProps> = (props) => {
	const context = useContext(AppContext);
	const userData = context.userData as UserDataModel;

	const [defaultCurrency, setDefaultCurrency] = useState<null | any>(null);
	const [defaultLanguage, setDefaultLanguage] = useState<string>(
		userData !== null
			? userData.default_language.name
			: Constant.DEFAULT_LANGUAGE_NAME
	);
	const [isLanguageModal, setIsLanguageModal] = useState<boolean>(false);
	const [isOverlayModalOpen, setOverlayModalStatus] = useState<boolean>(false);
	const [isOpenTerm, setIsOpenTerm] = useState<boolean>(false);
	const [isOpenPrivacyPolicy, togglePrivacyPolicy] = useState<boolean>(false);
	const [currencies, setCurrencies] = useState<Array<any>>([]);
	const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);

	useEffect(() => {
		const unsubscribe = props.navigation.addListener("focus", () => {
			getLanguageCode()
				.then((code: null | string) => {
					if (code !== null) {
						setDefaultLanguage(getLanguageNameByCode(code));
					} else {
						setDefaultLanguage(Constant.DEFAULT_LANGUAGE_NAME);
					}
				})
				.catch((error) => {
					setDefaultLanguage(Constant.DEFAULT_LANGUAGE_NAME);
				});

			getBiometricValue()
				.then((value: null | string) => {
					if (value !== null) {
						if (value === "YES") {
							setIsBiometricEnabled(true);
						} else {
							setIsBiometricEnabled(false);
						}
					} else {
						setIsBiometricEnabled(false);
					}
				})
				.catch((error) => {
					setIsBiometricEnabled(false);
				});
		});
		return unsubscribe;
	}, [props.navigation]);

	useEffect(() => {
		getAllCurrencies()
			.then((response) => {
				setCurrencies(response.data);
			})
			.catch((err) => {});
	}, []);

	const gotoEditProfile = () => {
		if (userData !== null) {
			props.navigation.navigate("EditProfile");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	useEffect(() => {
		const backAction = () => {
			props.navigation.dispatch(
				CommonActions.reset({
					index: 0,
					routes: [
						{
							name: "HomeTab",
							params: { screen: "Home" },
						},
					],
				})
			);
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, []);

	const gotoChangePassword = () => {
		if (userData !== null) {
			props.navigation.navigate("ChangePassword");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const gotoMyDocuments = () => {
		if (userData !== null) {
			props.navigation.navigate("MyDocuments");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const gotoMyBookings = () => {
		if (userData !== null) {
			props.navigation.navigate("MyBookings");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const gotoEsimList = () => {
		if (userData !== null) {
			props.navigation.navigate("EsimList");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const gotoMyOrders = () => {
		if (userData !== null) {
			props.navigation.navigate("MyOrders");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const onAccountDelete = () => {
		props.navigation.navigate("DeleteAccount");
	};

	const gotoConditions = () => {
		setIsOpenTerm(true);
	};

	const onCloseModal = () => {
		setIsOpenTerm(false);
	};

	const openPrivacyPolicy = () => {
		togglePrivacyPolicy(true);
	};

	const closePrivacyPolicy = () => {
		togglePrivacyPolicy(false);
	};

	const getAvatarText = () => {
		const name: string = userData !== null ? userData.name : "Guest User";
		const firstLetter = name.substring(0, 1);
		return firstLetter;
	};

	const onOpenLanguageModal = () => {
		setIsLanguageModal(true);
	};

	const onChangeLanguage = (language: any) => {
		if (userData !== null) {
			setIsLanguageModal(false);
			setOverlayModalStatus(true);

			const reqData = {
				language_name: language.name,
				language_code: language.code,
			};

			updateProfile(reqData)
				.then((response) => {
					if (response.check === true) {
						LocalizedText.setLanguage(language.code);
						setDefaultLanguage(language.name);
						saveLanguageCode(language.code);

						userData.default_language = {
							name: language.name,
							code: language.code,
						};

						context.setUserData(userData);
						setOverlayModalStatus(false);
					} else {
						setOverlayModalStatus(false);
						Alert.alert(LocalizedText.FAILED, response.message);
					}
				})
				.catch((error) => {
					setOverlayModalStatus(false);
				});
		} else {
			LocalizedText.setLanguage(language.code);
			saveLanguageCode(language.code);
			setDefaultLanguage(language.name);
			setIsLanguageModal(false);
		}
	};

	const onCloseLanguage = () => {
		setIsLanguageModal(false);
	};

	const onSelectCurrency = (value: any) => {
		setOverlayModalStatus(true);

		const reqData = {
			currency: {
				name: value.name,
				code: value.code,
				decimal_point: value.decimal_point,
			},
		};

		updateProfile(reqData)
			.then((response) => {
				setDefaultCurrency(value.name);
				userData.currency = {
					name: value.name,
					code: value.code,
					decimal_point: value.decimal_point,
				};

				context.setUserData(userData);
				setOverlayModalStatus(false);
			})
			.catch((error) => {
				setOverlayModalStatus(false);
			});
	};

	const onSignOut = () => {
		Alert.alert(LocalizedText.SIGNOUT, LocalizedText.SIGNOUT_ALERT, [
			{ text: LocalizedText.NO, style: "cancel" },
			{
				text: LocalizedText.YES,
				onPress: () => {
					removeAccessToken();
					removeRefreshToken();
					saveBiometricValue("NO");
					setIsBiometricEnabled(false);
					context.unsetUserData();
				},
			},
		]);
	};

	const gotoSignIn = () => {
		props.navigation.navigate("SignIn");
	};

	const onBiomtericToggle = async () => {
		if (userData !== null) {
			const biometricValue = await getBiometricValue();
			if (biometricValue === "YES") {
				Alert.alert(
					"Biometric",
					"Do you want to disable biomteric authentication for future login purposes?",
					[
						{
							text: "No",
							style: "cancel",
						},
						{
							text: "Yes",
							onPress: async () => {
								await saveBiometricValue("NO");
								setIsBiometricEnabled(false);
							},
						},
					]
				);
			} else {
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
							},
							{
								text: "Yes",
								onPress: async () => {
									await saveBiometricValue("YES");
									setIsBiometricEnabled(true);
								},
							},
						]
					);
				} else {
					Alert.alert(
						"Sorry",
						"This feature is not supported on your device.",
						[{ text: "Ok", style: "default" }]
					);
				}
			}
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	return (
		<Container>
			<Header title={LocalizedText.MY_ACCOUNT} />

			<WhiteContainer style={styles.container}>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View
						style={{
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<View style={styles.userImage}>
							<Text style={styles.avatarText}>{getAvatarText()}</Text>
						</View>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								marginVertical: 15,
							}}
						>
							{userData !== null ? (
								<Fragment>
									<Text style={styles.userTitle}>{userData.name}</Text>
									<Text style={styles.userEmail}>{userData.email}</Text>
								</Fragment>
							) : (
								<Text style={styles.userTitle}>{"Guest User"}</Text>
							)}
						</View>
					</View>

					<Text style={styles.menuGroupLabel}>{LocalizedText.ACCOUNTS}</Text>
					<Card style={styles.card}>
						<Menulist
							icon={faFile}
							title={LocalizedText.MY_DOCUMENTS}
							onPress={gotoMyDocuments}
							style={styles.firstListItem}
						/>
						<Menulist
							icon={faCube}
							title={LocalizedText.MY_ORDERS}
							onPress={gotoMyOrders}
						/>
						<Menulist
							icon={faCalendarClock}
							title={LocalizedText.MY_BOOKINGS}
							onPress={gotoMyBookings}
						/>
						<Menulist icon={faSimCard} title="E-sim" onPress={gotoEsimList} />
						<Menulist
							icon={faUser}
							title={LocalizedText.EDIT_PROFILE}
							onPress={gotoEditProfile}
						/>
						<Menulist
							icon={faLockKeyhole}
							title={LocalizedText.CHANGE_PASSWORD}
							onPress={gotoChangePassword}
						/>

						<Menulist
							icon={faFingerprint}
							title={LocalizedText.BIOMETRIC_AUTHENTICATION}
							type="switch"
							value={isBiometricEnabled}
							onPress={onBiomtericToggle}
							style={styles.lastListItem}
						/>
					</Card>

					{/* <Text style={styles.menuGroupLabel}>{LocalizedText.LEGAL}</Text> */}
					<Text style={styles.menuGroupLabel}>{"Other"}</Text>
					<Card style={styles.card}>
						<MenulistOption
							icon={faLanguage}
							title={LocalizedText.LANGUAGE}
							value={defaultLanguage}
							onPress={onOpenLanguageModal}
						/>
						<Menulist
							icon={faGavel}
							title={LocalizedText.TERMS_AND_CONDITIONS}
							onPress={gotoConditions}
						/>
						<Menulist
							icon={faShieldCheck}
							title={LocalizedText.PRIVACY_POLICY}
							onPress={openPrivacyPolicy}
						/>
						{userData !== null ? (
							<CurrencyPicker
								variant={"MENULIST"}
								currencies={currencies}
								onSelect={onSelectCurrency}
								value={userData.currency.code}
								style={[styles.lastListItem]}
							/>
						) : null}
					</Card>

					{userData !== null ? (
						<Fragment>
							<Text style={styles.menuGroupLabel}>{"Delete Account"}</Text>
							<Card style={styles.card}>
								<View
									style={{
										width: "100%",
										flexDirection: "row",
										alignItems: "center",
										paddingHorizontal: 6,
										paddingVertical: 8,
									}}
								>
									<View style={styles.iconStyle}>
										<FontAwesomeIcon
											size={20}
											icon={faTrash}
											color={Colors.secondaryBtn}
										/>
									</View>
									<Text style={styles.deleteAccountTitle}>
										{LocalizedText.DELETE_ACCOUNT}
									</Text>
								</View>
								<View
									style={{
										width: "100%",
										marginTop: 5,
										paddingLeft: 15,
										paddingRight: 6,
									}}
								>
									<Text style={styles.deleteAccountText}>
										{LocalizedText.DELETE_ACCOUNT_HINT}
									</Text>
								</View>
								<Button
									title={LocalizedText.DELETE_ACCOUNT}
									style={styles.deleteBtn}
									titleStyle={{ color: Colors.danger }}
									onPress={onAccountDelete}
								/>
							</Card>
						</Fragment>
					) : null}

					<Card style={[styles.card, { marginTop: 25 }]}>
						<Menulist
							icon={
								userData === null
									? faArrowRightToBracket
									: faArrowRightFromBracket
							}
							title={
								userData === null
									? LocalizedText.SIGN_IN
									: LocalizedText.SIGNOUT
							}
							onPress={userData === null ? gotoSignIn : onSignOut}
							style={[styles.firstListItem, styles.lastListItem]}
						/>
					</Card>
					<View style={{ height: 80, width: "100%" }} />
				</ScrollView>
			</WhiteContainer>

			<Language
				isVisible={isLanguageModal}
				onClose={onCloseLanguage}
				onChange={onChangeLanguage}
			/>

			{/* <Currency
				currencies={currencies}
				isVisible={isCurrencyModal}
				onClose={onCloseCurrencyModal}
				onSelect={onSelectCurrency}
			/> */}
			{/* <CurrencyPicker
				variant={"MENULIST"}
				currencies={currencies}
				isVisible={isCurrencyModal}
				selectedCurrency={selectedCurrency}
				onSelect={onSelectCurrency}
				onClose={onCloseCurrencyModal}
			/> */}

			<TermsAndConditions
				title={"Terms and Conditions"}
				isVisible={isOpenTerm}
				closeModal={onCloseModal}
				isShowButton={false}
			/>

			<PrivacyPolicy
				isVisible={isOpenPrivacyPolicy}
				onClose={closePrivacyPolicy}
			/>

			<OverlayLoader visible={isOverlayModalOpen} />
		</Container>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 0,
		paddingTop: 25,
	},
	userImage: {
		height: 60,
		width: 60,
		borderRadius: 100,
		backgroundColor: Colors.secondary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		fontSize: 30,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.white,
	},
	userTitle: {
		fontSize: 17,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		textAlign: "center",
	},
	userEmail: {
		fontSize: 14,
		fontFamily: "Roboto-Light",
		color: Colors.secondaryFont,
		textAlign: "center",
		lineHeight: 25,
	},
	card: {
		width: Constant.WINDOW_WIDTH - 30,
		marginHorizontal: 15,
	},
	userMenuList: {
		justifyContent: "space-between",
		alignItems: "center",
		flexDirection: "row",
		paddingHorizontal: 6,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	firstListItem: {
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
	},
	lastListItem: {
		borderBottomWidth: 0,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
	menuGroupLabel: {
		color: Colors.secondaryFont,
		fontSize: 14,
		marginHorizontal: 15,
		marginTop: 20,
		marginBottom: 10,
		opacity: 0.6,
	},
	iconStyle: {
		width: 35,
		height: 35,
		borderRadius: 90,
		justifyContent: "center",
		alignItems: "center",
	},
	deleteAccountTitle: {
		fontSize: 15,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		opacity: 0.9,
		marginLeft: 15,
	},
	deleteAccountText: {
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		lineHeight: 18,
	},
	deleteBtn: {
		width: "auto",
		minWidth: 100,
		height: 40,
		paddingHorizontal: 10,
		marginVertical: 20,
		marginRight: 15,
		alignSelf: "flex-end",
		borderColor: Colors.danger,
		backgroundColor: "rgba(220, 53, 70, 0.2)",
	},
});

export default Account;
