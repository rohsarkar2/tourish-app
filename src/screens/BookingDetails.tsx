import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { BookingDetailsScreenProps } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";
import BookingStatus, { BookingPaymentStatus } from "../configs/BookingStatus";
import {
	Header,
	Loader,
	Container,
	WhiteContainer,
	Button,
	Accordion,
} from "../components";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons/faLocationDot";
import { faHashtag } from "@fortawesome/pro-light-svg-icons/faHashtag";
import { faCalendar } from "@fortawesome/pro-light-svg-icons/faCalendar";
import { faLanguage } from "@fortawesome/pro-light-svg-icons/faLanguage";
import { faShieldCheck } from "@fortawesome/pro-light-svg-icons/faShieldCheck";
import { faMoneyBill } from "@fortawesome/pro-light-svg-icons/faMoneyBill";
import { faCar } from "@fortawesome/pro-light-svg-icons/faCar";
import { faIdCard } from "@fortawesome/pro-light-svg-icons/faIdCard";
import { faPersonSeat } from "@fortawesome/pro-light-svg-icons/faPersonSeat";
import { faSuitcaseRolling } from "@fortawesome/pro-light-svg-icons/faSuitcaseRolling";
import { faSquare } from "@fortawesome/pro-solid-svg-icons/faSquare";
import moment from "moment-timezone";
import BookingService from "../services/BookingService";
import { toUpperCaseWord } from "../utils/Util";
import MaterialTabs from "react-native-material-tabs";

const BookingDetails: React.FC<BookingDetailsScreenProps> = (
	props: BookingDetailsScreenProps
): React.ReactElement => {
	const [bookingDetails, setBookingDetails] = useState<any>(null);
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		BookingService.getDetails(props.route.params.bookingId)
			.then((response) => {
				setBookingDetails(response.data);
				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
			});
	}, []);

	const getStatusColor = (status: string) => {
		let labelColor = "";
		switch (status) {
			case BookingStatus.PENDING:
				labelColor = Colors.warning;
				break;
			case BookingStatus.ACCEPTED:
				labelColor = Colors.primary;
				break;
			case BookingStatus.REJECTED:
				labelColor = Colors.danger;
				break;
			case BookingStatus.CONFIRMED:
				labelColor = Colors.success;
				break;
			case BookingStatus.RESCHEDULE_CONFIRMED:
				labelColor = Colors.success;
				break;
			case BookingStatus.CANCELLED:
				labelColor = Colors.danger;
				break;
			default:
				break;
		}
		return labelColor;
	};

	const gotoPayment = () => {
		props.navigation.navigate("Payment", {
			bookingId: bookingDetails._id,
			bookingNo: bookingDetails.bookingNumber,
			orderAmount: bookingDetails.targetedPrice.value,
			currency: bookingDetails.targetedPrice.code,
			productId: bookingDetails.product._id,
		});
	};

	const getLanguageString = (languages: Array<any>): string => {
		const names: Array<string> = languages.map((item: any) => item.name);
		return names.join(", ");
	};

	const onChangeCarDriverTab = (index: number) => {
		setSelectedTabIndex(index);
	};

	return (
		<Container>
			<Header title={`#${props.route.params.bookingNo}`} />
			<WhiteContainer style={{ paddingHorizontal: 0 }}>
				{isLoading ? (
					<Loader />
				) : (
					<View style={{ flex: 1, width: "100%" }}>
						<ScrollView
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps="handled"
							contentContainerStyle={{ paddingHorizontal: 20 }}
						>
							<View
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<View style={{ width: "65%" }}>
									<Text style={styles.boldText}>
										{bookingDetails.product.name}
									</Text>
								</View>

								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										justifyContent: "flex-end",
										width: "35%",
									}}
								>
									<Text
										style={[
											styles.boldText,
											{ color: Colors.primaryBtn, fontSize: 12 },
										]}
									>
										{bookingDetails.targetedPrice.code}
									</Text>
									<Text style={styles.productDetailsPriceValue}>
										{Number(bookingDetails.targetedPrice.value).toFixed(2)}
									</Text>
								</View>
							</View>

							<View style={[styles.itemRow, { marginTop: 20 }]}>
								<FontAwesomeIcon
									icon={faHashtag}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 2 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Booking No."}</Text>
									<Text style={styles.value}>
										{bookingDetails.bookingNumber}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faLocationDot}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 3 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Source"}</Text>
									<Text
										style={styles.value}
										numberOfLines={2}
										ellipsizeMode="tail"
									>
										{bookingDetails.product.source}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faLocationDot}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 3 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Destination"}</Text>
									<Text
										style={styles.value}
										numberOfLines={2}
										ellipsizeMode="tail"
									>
										{bookingDetails.product.destination}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faPersonSeat}
									size={19}
									color={Colors.secondary}
									style={{ marginTop: 3 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>
										{"No. of Passengers (including driver)"}
									</Text>
									<Text style={styles.value}>
										{`${bookingDetails.product.numberOfSeats} `}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faSuitcaseRolling}
									size={19}
									color={Colors.secondary}
									style={{ marginTop: 3 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Luggage"}</Text>
									<Text
										style={styles.value}
										ellipsizeMode="tail"
										numberOfLines={2}
									>
										{bookingDetails.product.baggageInfo}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faCalendar}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 2 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Booking Date & Time"}</Text>
									<Text style={[styles.value, { fontSize: 13 }]}>
										{moment
											.utc(bookingDetails.bookingDateTime)
											.format("DD/MM/YYYY HH:mm")}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faShieldCheck}
									size={16}
									color={Colors.secondary}
									style={{ marginTop: 2 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Status"}</Text>
									<Text
										style={[
											styles.value,
											{ color: getStatusColor(bookingDetails.status) },
										]}
									>
										{toUpperCaseWord(bookingDetails.status.toLowerCase())}
									</Text>
								</View>
							</View>

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faMoneyBill}
									size={18}
									color={Colors.secondary}
									style={{ marginTop: 2 }}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Payment Status"}</Text>
									{bookingDetails.paymentStatus !== null ? (
										<Text
											style={[
												styles.value,
												{
													color:
														bookingDetails.paymentStatus ===
														BookingPaymentStatus.PAID
															? Colors.success
															: Colors.danger,
												},
											]}
										>
											{toUpperCaseWord(
												bookingDetails.paymentStatus.toLowerCase()
											)}
										</Text>
									) : (
										<Text style={[styles.value, { color: Colors.primaryBtn }]}>
											{"Pending"}
										</Text>
									)}
								</View>
							</View>
							{/* {bookingDetails.status === BookingStatus.CONFIRMED &&
							bookingDetails.hasOwnProperty("carDetail") ? (
								<View style={styles.itemRow}>
									<FontAwesomeIcon
										icon={faCar}
										size={16}
										color={Colors.secondary}
										style={{ marginTop: 2 }}
									/>
									<View style={styles.labelValueBox}>
										<Text style={styles.label}>{"Cab Details"}</Text>
										<View
											style={{ flexDirection: "row", alignItems: "center" }}
										>
											<Text style={styles.value}>
												{bookingDetails.carDetail.maker}
											</Text>
											<Text style={styles.value}>
												{`, ${bookingDetails.carDetail.model}`}
											</Text>
										</View>
										<Text style={[styles.value, { fontSize: 12 }]}>
											{bookingDetails.carDetail.registrationNumber}
										</Text>
									</View>
								</View>
							) : null}

							{bookingDetails.status === BookingStatus.CONFIRMED &&
							bookingDetails.hasOwnProperty("driverDetail") ? (
								<View style={styles.itemRow}>
									<FontAwesomeIcon
										icon={faIdCard}
										size={16}
										color={Colors.secondary}
										style={{ marginTop: 2 }}
									/>
									<View style={styles.labelValueBox}>
										<Text style={styles.label}>{"Driver Details"}</Text>
										<Text style={styles.value}>
											{bookingDetails.driverDetail.name}
										</Text>
										<Text style={[styles.value, { fontSize: 12 }]}>
											{bookingDetails.driverDetail.contactNumber}
										</Text>
									</View>
								</View>
							) : null} */}

							<View style={styles.itemRow}>
								<FontAwesomeIcon
									icon={faLanguage}
									size={18}
									color={Colors.secondary}
								/>
								<View style={styles.labelValueBox}>
									<Text style={styles.label}>{"Language"}</Text>
									{Array.isArray(bookingDetails.product.languages) ? (
										bookingDetails.product.languages.length > 0 ? (
											<Text style={[styles.value, { fontSize: 13 }]}>
												{getLanguageString(bookingDetails.product.languages)}
											</Text>
										) : (
											<Text style={[styles.value, { fontSize: 13 }]}>
												{"N/A"}
											</Text>
										)
									) : (
										<Text style={[styles.value, { fontSize: 13 }]}>
											{"N/A"}
										</Text>
									)}
								</View>
							</View>

							<Accordion
								data={[
									{
										title: "Features",
										content: bookingDetails.product.features.map(
											(item: any, index: any) => (
												<View
													key={index}
													style={{
														flexDirection: "row",
														alignItems: "flex-start",
														marginBottom: 3,
													}}
												>
													<FontAwesomeIcon
														icon={faSquare}
														size={9}
														color={Colors.mediumGrey}
														style={{ marginRight: 8, marginTop: 2 }}
													/>
													<Text style={styles.smallText}>{item}</Text>
												</View>
											)
										),
									},
									{
										title: "Inclusions",
										content: bookingDetails.product.inclusion.map(
											(item: any, index: any) => (
												<View
													key={`inclusion-${index}`}
													style={{ flexDirection: "row", marginBottom: 3 }}
												>
													<FontAwesomeIcon
														icon={faSquare}
														size={9}
														color={Colors.mediumGrey}
														style={{ marginRight: 8 }}
													/>
													<Text style={styles.lightText}>{item}</Text>
												</View>
											)
										),
									},
									{
										title: "Exclusions",
										content: bookingDetails.product.exclusion.map(
											(item: any, index: any) => (
												<View
													key={`exclusion-${index}`}
													style={{ flexDirection: "row", marginBottom: 3 }}
												>
													<FontAwesomeIcon
														icon={faSquare}
														size={9}
														color={Colors.mediumGrey}
														style={{ marginRight: 8 }}
													/>
													<Text style={styles.lightText}>{item}</Text>
												</View>
											)
										),
									},
								]}
							/>

							{(bookingDetails.status === BookingStatus.CONFIRMED ||
								bookingDetails.status ||
								BookingStatus.RESCHEDULE_CONFIRMED) &&
							bookingDetails.hasOwnProperty("carDetail") &&
							bookingDetails.hasOwnProperty("driverDetail") ? (
								<>
									<View style={styles.tabView}>
										<MaterialTabs
											items={["Car Details", "Driver Details"]}
											selectedIndex={selectedTabIndex}
											onChange={onChangeCarDriverTab}
											barColor={Colors.white}
											indicatorColor={Colors.secondary}
											activeTextColor={Colors.secondary}
											inactiveTextColor={Colors.lightFont}
											scrollable={false}
											uppercase={false}
										/>
									</View>
									<View style={{ marginHorizontal: 2, marginVertical: 5 }}>
										{selectedTabIndex === 0 ? (
											<View style={styles.card}>
												<View
													style={{
														width: "20%",
													}}
												>
													<Image
														source={{ uri: bookingDetails.carDetail.image }}
														resizeMode="contain"
														style={{
															width: 60,
															height: 60,
															borderRadius: 50,
															borderColor: Colors.mediumGrey,
															borderWidth: 1,
														}}
													/>
												</View>
												<View
													style={{
														width: "80%",
														paddingLeft: 5,
													}}
												>
													<Text
														style={{
															fontSize: 14,
															color: Colors.primaryFont,
															letterSpacing: 0.5,
															lineHeight: 21,
															fontFamily: "Roboto-Medium",
														}}
													>
														{`${bookingDetails.carDetail.registrationNumber}`}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: Colors.primaryFont,
															letterSpacing: 0.5,
															lineHeight: 18,
															fontFamily: "Roboto-Regular",
														}}
													>
														{`${bookingDetails.carDetail.maker} ${bookingDetails.carDetail.model}`}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: Colors.primaryFont,
															letterSpacing: 0.5,
															lineHeight: 18,
															fontFamily: "Roboto-Regular",
														}}
													>
														{toUpperCaseWord(bookingDetails.carDetail.fuelType)}
													</Text>
												</View>
											</View>
										) : (
											<View style={styles.card}>
												<View
													style={{
														width: "20%",
													}}
												>
													<Image
														source={{ uri: bookingDetails.driverDetail.image }}
														resizeMode="contain"
														style={{
															width: 60,
															height: 60,
															borderRadius: 50,
															borderColor: Colors.mediumGrey,
															borderWidth: 1,
														}}
													/>
												</View>
												<View
													style={{
														width: "80%",
														paddingLeft: 5,
													}}
												>
													<Text
														style={{
															fontSize: 14,
															color: Colors.primaryFont,
															letterSpacing: 0.5,
															lineHeight: 21,
															fontFamily: "Roboto-Medium",
														}}
													>
														{bookingDetails.driverDetail.name}
													</Text>
													<Text
														style={{
															fontSize: 12,
															color: Colors.primaryFont,
															letterSpacing: 0.5,
															lineHeight: 18,
															fontFamily: "Roboto-Regular",
														}}
													>
														{bookingDetails.driverDetail.contactNumber}
													</Text>
												</View>
											</View>
										)}
									</View>
								</>
							) : null}
						</ScrollView>
						{bookingDetails.status === BookingStatus.ACCEPTED ? (
							<Button
								title={`Pay ${bookingDetails.targetedPrice.code} ${bookingDetails.targetedPrice.value}`}
								style={{ width: "92%", alignSelf: "center", marginBottom: 20 }}
								titleStyle={{ fontFamily: "Roboto-Medium", fontWeight: "500" }}
								onPress={gotoPayment}
							/>
						) : null}
					</View>
				)}
			</WhiteContainer>
		</Container>
	);
};

export default BookingDetails;

const styles = StyleSheet.create({
	productDetailsPriceValue: {
		fontSize: 18,
		marginLeft: 3,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 15,
	},
	labelValueBox: {
		flex: 1,
		paddingLeft: 8,
	},
	label: {
		fontSize: 12,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.6,
	},
	value: {
		fontSize: 13,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	smallText: {
		fontSize: 11,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	boldText: {
		fontSize: 16,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
		lineHeight: 15,
	},
	tabView: {
		borderBottomColor: Colors.lightBorder,
		borderBottomWidth: 0.8,
		marginVertical: 5,
	},
	card: {
		width: "100%",
		padding: 10,
		flexDirection: "row",
		backgroundColor: Colors.white,
		marginVertical: 8,
		borderRadius: 10,
		shadowColor: Colors.mediumGrey,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.5,
		shadowRadius: 8,
		elevation: 6,
	},
	regularText: {
		fontSize: 14,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
});
