import React, { useContext, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	BackHandler,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { TopUpPaymentScreenProps } from "../navigation/NavigationTypes";
import {
	PaymentSheetError,
	StripeProvider,
	useStripe,
} from "@stripe/stripe-react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons/faCircleCheck";
import { faCircleExclamation } from "@fortawesome/pro-solid-svg-icons/faCircleExclamation";
import AppContext from "../context/AppContext";
import Colors from "../configs/Colors";
import PaymentService from "../services/PaymentService";
import Constant from "../configs/Constant";
import { Button, Container, WhiteContainer } from "../components";
import { CommonActions } from "@react-navigation/native";

const TopUpPayment: React.FC<TopUpPaymentScreenProps> = (
	props: TopUpPaymentScreenProps
): React.ReactElement => {
	const { userData, setUserData, setSearchData } = useContext(AppContext);
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	const [paymentIntentId, setPaymentIntentId] = useState<undefined | string>(
		undefined
	);
	const [clientSecret, setClientSecret] = useState<undefined | string>(
		undefined
	);
	const [ephemeralKey, setEphemeralKey] = useState<undefined | string>(
		undefined
	);
	const [stripeCustomerId, setStripeCustomerId] = useState<undefined | string>(
		undefined
	);
	const [isInitializing, setInitializing] = useState<boolean>(true);
	const [orderId, setOrderID] = useState(undefined);
	const [orderNumber, setOrderNumber] = useState(undefined);
	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [isPaymentSuccess, setPaymentSuccess] = useState<boolean>(false);
	const [isPaymentFailed, setPaymentFailed] = useState<boolean>(false);

	const totalAmount: number = props.route.params.orderAmount;
	const currency: string = props.route.params.orderCurrency;
	const billingDetails = {
		name: userData?.name,
		email: userData?.email,
		address: { country: userData?.country.code },
	};

	useEffect(() => {
		initializePaymentSheet();
	}, []);

	useEffect(() => {
		openPaymentSheet();
	}, [clientSecret]);

	useEffect(() => {
		const backAction = () => {
			return true;
		};
		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);
		return () => backHandler.remove();
	}, []);

	const gotoBack = () => {
		props.navigation.goBack();
	};

	const gotoHome = () => {
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
	};

	const goToEsimDetails = () => {
		let productId: string = "";
		let esimId: string = "";
		let productName: string = "";

		if (typeof props.route.params.productId !== "undefined") {
			productId = props.route.params.productId;
		}

		if (typeof props.route.params.esimId !== "undefined") {
			esimId = props.route.params.esimId;
		}

		if (typeof props.route.params.productName !== "undefined") {
			productName = props.route.params.productName;
		}

		props.navigation.navigate("JourneyEsimDetails", {
			productId: productId,
			productName: productName,
			esimId: esimId,
		});
	};

	const initializePaymentSheet = async () => {
		const reqData: any = {
			customerId: userData?._id,
			customerName: userData?.name,
			customerEmail: userData?.email,
			orderCurrency: currency,
			orderAmount: totalAmount,
		};
		if (typeof props.route.params.esimId !== "undefined") {
			reqData.esimId = props.route.params.esimId;
		}
		if (typeof props.route.params.quoteId !== "undefined") {
			reqData.quoteId = props.route.params.quoteId;
		}
		if (typeof props.route.params.planId !== "undefined") {
			reqData.planId = props.route.params.planId;
		}
		try {
			const intentResponse: any = await PaymentService.esimTopUpIntent(reqData);
			const intentData: any = intentResponse.data;

			const { error } = await initPaymentSheet({
				merchantDisplayName: "Swissynergizers GmbH.",
				customerId: intentData.customer_id,
				customerEphemeralKeySecret: intentData.ephemeral_key,
				paymentIntentClientSecret: intentData.client_secret,
				allowsDelayedPaymentMethods: true,
				style: "automatic",
				defaultBillingDetails: billingDetails,
				appearance: {
					colors: {
						primary: Colors.primaryBtn,
						background: Colors.white,
						componentBackground: Colors.white,
						componentBorder: Colors.lightBorder,
						componentDivider: Colors.lightBorder,
						primaryText: Colors.primaryFont,
						secondaryText: Colors.secondaryFont,
						componentText: Colors.secondaryFont,
						placeholderText: Colors.mediumGrey,
						icon: Colors.mediumGrey,
						error: Colors.danger,
					},
					shapes: {
						borderRadius: 5,
						borderWidth: 1,
						shadow: {
							color: Colors.white,
							opacity: 1,
							offset: { x: 0, y: 0 },
							blurRadius: 4,
						},
					},
					primaryButton: {
						colors: {
							background: Colors.primaryBtn,
							text: Colors.white,
							border: Colors.primaryBtn,
						},
						shapes: {
							borderWidth: 0,
							borderRadius: 25,
						},
					},
				},
			});

			if (error) {
				setInitializing(false);
				Alert.alert("Failed", "Payment sheet initialization failed.", [
					{ text: "OK", onPress: gotoBack },
				]);
			} else {
				setOrderID(intentData.orderId);
				setOrderNumber(intentData.orderNumber);
				setPaymentIntentId(intentData.id);
				setEphemeralKey(intentData.ephemeral_key);
				setStripeCustomerId(intentData.customer_id);
				setClientSecret(intentData.client_secret);
				setInitializing(false);
			}
		} catch (error: any) {
			setInitializing(false);
			Alert.alert("Failed", "Sorry could not initialize the payment", [
				{ text: "OK", onPress: gotoBack },
			]);
		}
	};

	const openPaymentSheet = async () => {
		if (typeof clientSecret === "undefined") {
			return;
		}

		const { error } = await presentPaymentSheet();
		if (!error) {
			onPaymentSuccess();
		} else if (error.code === PaymentSheetError.Failed) {
			setProcessing(false);
			setPaymentSuccess(false);
			setPaymentFailed(true);
			// setSearchData([]);
		} else if (error.code === PaymentSheetError.Canceled) {
			Alert.alert("Cancelled", error.message, [
				{ text: "OK", onPress: gotoBack },
			]);
		}
	};

	const onPaymentSuccess = () => {
		setProcessing(true);
		const reqData = {
			orderId,
			clientSecret,
			ephemeralKey,
			stripeCustomerId,
			intentId: paymentIntentId,
		};

		PaymentService.verifyTopUp(reqData)
			.then((response: any) => {
				setProcessing(false);
				setPaymentFailed(false);
				setPaymentSuccess(true);
				// setSearchData([]);
			})
			.catch((error) => {
				setProcessing(false);
				setPaymentSuccess(false);
				setPaymentFailed(true);
				// setSearchData([]);
			});
	};

	return (
		<StripeProvider publishableKey={Constant.STRIPE_PUBLISH_KEY}>
			<Container>
				<WhiteContainer
					style={{ alignItems: "center", justifyContent: "center" }}
				>
					{isInitializing ? (
						<>
							<ActivityIndicator
								size="large"
								color={Colors.primaryBtn}
								style={{ marginBottom: 10 }}
							/>
							<Text style={styles.loadingText}>{"Initializing"}</Text>
							<Text style={styles.subText}>
								{"Please wait while initialize the payment."}
							</Text>
						</>
					) : null}

					{isProcessing ? (
						<>
							<ActivityIndicator
								size="large"
								color={Colors.primaryBtn}
								style={{ marginBottom: 10 }}
							/>
							<Text style={styles.loadingText}>{"Verifying"}</Text>
							<Text style={styles.subText}>
								{"Please wait while we are verifying your payment."}
							</Text>
						</>
					) : null}

					{isPaymentSuccess ? (
						<View style={{ flex: 1, width: "100%" }}>
							<View
								style={{
									flex: 1,
									width: "100%",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<FontAwesomeIcon
									icon={faCircleCheck}
									size={70}
									color={Colors.success}
									style={{ marginBottom: 30 }}
								/>
								<Text style={styles.heading}>{"Payment Success"}</Text>
								<Text
									style={[
										styles.subText,
										{ fontSize: 14, textAlign: "center" },
									]}
								>
									{
										"Your E-sim has been credited with the requested top-up. Enjoy uninterrupted services!"
									}
								</Text>
								<View style={[styles.devider, { marginTop: 30 }]} />
								<View style={{ width: "100%", paddingVertical: 15 }}>
									<View style={[styles.infoRow, { paddingBottom: 5 }]}>
										<Text style={[styles.subText, { fontSize: 14 }]}>
											{"Order No."}
										</Text>
										<Text style={[styles.subText, { fontSize: 14 }]}>
											{orderNumber}
										</Text>
									</View>
									<View style={[styles.infoRow, { paddingTop: 5 }]}>
										<Text style={styles.loadingText}>{"Amount Paid"}</Text>
										<Text style={styles.loadingText}>
											{`${currency} ${totalAmount.toFixed(2)}`}
										</Text>
									</View>
								</View>
							</View>

							<View
								style={{
									width: "100%",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								{/* <Button
									title="Add to Tour Book"
									style={{ marginTop: 20, marginBottom: 10 }}
									onPress={onOpenTourList}
								/> */}
								<Button
									title="View Details"
									style={{
										marginVertical: 10,
										backgroundColor: Colors.white,
										borderWidth: 1,
										borderColor: Colors.primaryBtn,
									}}
									titleStyle={{ color: Colors.primaryBtn }}
									onPress={goToEsimDetails}
								/>
								<TouchableOpacity
									style={{ marginTop: 10, marginBottom: 20 }}
									onPress={gotoHome}
								>
									<Text
										style={[
											styles.boldText,
											{ color: Colors.secondary, textAlign: "center" },
										]}
									>
										{"Explore More"}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : null}

					{isPaymentFailed ? (
						<>
							<FontAwesomeIcon
								icon={faCircleExclamation}
								size={70}
								color={Colors.danger}
								style={{ marginBottom: 30, opacity: 0.9 }}
							/>
							<Text style={styles.heading}>{"Payment Failed"}</Text>
							<Text style={[styles.subText, { fontSize: 14 }]}>
								{"Sorry, we could not process your payment"}
							</Text>

							<Button
								title="Goto Home"
								titleStyle={{ color: Colors.primaryBtn }}
								style={styles.gotoHomeBtn}
								onPress={gotoHome}
							/>
						</>
					) : null}
				</WhiteContainer>
			</Container>
		</StripeProvider>
	);
};

export default TopUpPayment;

const styles = StyleSheet.create({
	loadingText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	subText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 22,
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginBottom: 5,
	},
	devider: {
		height: 1,
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	gotoHomeBtn: {
		height: 45,
		width: "80%",
		marginTop: 40,
		borderWidth: 1,
		backgroundColor: "transparent",
		borderColor: Colors.primaryBtn,
	},
	journeyModalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	journeyListContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.9),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	modalHeading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	card: {
		width: Constant.WINDOW_WIDTH - 20,
		paddingVertical: 10,
		marginHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		opacity: 0.9,
		lineHeight: 21,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
	errorTxt: {
		color: Colors.danger,
		fontSize: 12,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		marginBottom: 10,
		marginTop: 3,
		textAlign: "right",
	},
	addBtn: {
		flexDirection: "row",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		height: 35,
		width: Constant.WINDOW_WIDTH - 70,
		backgroundColor: Colors.white,
		borderWidth: 1,
		borderColor: Colors.primaryBtn,
		marginHorizontal: 20,
		marginVertical: 10,
		borderRadius: 30,
		borderStyle: "dashed",
	},
	addBtnText: {
		fontSize: 14,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryBtn,
		marginLeft: 5,
	},
});
