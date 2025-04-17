import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import Colors from "../configs/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTaxi } from "@fortawesome/pro-solid-svg-icons/faTaxi";
import { faCalendar } from "@fortawesome/pro-light-svg-icons/faCalendar";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons/faLocationDot";
import Constant from "../configs/Constant";
import moment from "moment-timezone";
import FlightDataCard from "./FlightDataCard";
import Card from "./Card";
import ProductCategory from "../configs/ProductCategory";
import { toUpperCaseWord } from "../utils/Util";

type Props = {
	activeOpacity: undefined | number;
	cityId: string;
	name: string;
	activity: any;
	isCancelled: boolean | null;
	description: Array<string>;
	flightStatus?: string | null;
	departureGate?: string | null;
	onEdit: () => void;
	onDelete: () => void;
	onPress?: () => void | undefined;
};

const styles = StyleSheet.create({
	activityName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		marginBottom: 3,
		opacity: 0.9,
	},
	activitiyDesc: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	menu: {
		height: 35,
	},
	menuText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.primaryFont,
	},
	cardContainer: {
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: "100%",
		borderWidth: 1,
		elevation: 0,
		borderColor: Colors.lightGrey,
	},
	titleText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryBg,
	},
	dateTimeTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
	},
	checkInCheckOutTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		marginBottom: 5,
	},
	iconTxtGap: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 5,
	},
	productCategoryTxt: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.lightFont,
	},
	iconStyle: { marginBottom: 2, marginRight: 5 },
});

const TourActivity: React.FC<Props> = (props) => {
	const [isMenuOpen, toggleMenu] = useState<boolean>(false);

	const onOpenMenu = () => {
		toggleMenu(true);
	};

	const onCloseMenu = () => {
		toggleMenu(false);
	};

	const gotoEditActivity = () => {
		toggleMenu(false);
		props.onEdit();
	};

	const deleteActivity = () => {
		toggleMenu(false);
		props.onDelete();
	};

	let flightData: any = {};
	if (props.activity.activity_slug === Constant.FLIGHT_SLUG) {
		flightData.carrierFsCode = props.activity.flightCode;
		flightData.flightNumber = props.activity.flightNo;
		flightData.departureAirportFsCode = props.activity.origin.iataCode;
		flightData.arrivalAirportFsCode = props.activity.destination.iataCode;
		flightData.departureDate = {
			dateLocal: moment(
				`${moment(props.activity.departureDate).format("YYYY-MM-DD")} ${
					props.activity.departureTime
				}`
			).format("YYYY-MM-DD HH:mm:ss"),
		};
		flightData.status = props.activity.flightStatus;
		flightData.arrivalDate = {
			dateLocal: moment(
				`2024-05-30 ${props.activity.arrivalTime}`,
				"YYYY-MM-DD HH:mm:ss"
			).format("YYYY-MM-DD HH:mm:ss"),
		};

		flightData.airportResources = {
			departureTerminal: props.activity.departureTerminal,
			arrivalTerminal: props.activity.arrivalTerminal,
			departureGate: props.activity.departureGate,
			arrivalGate: props.activity.arrivalGate,
		};
	}

	return (
		<Menu
			visible={isMenuOpen}
			onRequestClose={onCloseMenu}
			anchor={
				<TouchableOpacity
					activeOpacity={props.activeOpacity}
					onLongPress={onOpenMenu}
				>
					{props.activity.activity_slug === Constant.FLIGHT_SLUG ? (
						<FlightDataCard
							flightData={flightData}
							departureCity={props.activity.origin.location}
							arrivalCity={props.activity.destination.location}
							flightDuration={props.activity.flightDuration}
							flightIataData={props.activity.equipmentName}
							style={{
								width: "100%",
								borderWidth: 1,
								elevation: 0,
								borderColor: Colors.lightGrey,
							}}
						/>
					) : props.activity.activity_slug === Constant.CAB_SLUG ? (
						<Card style={styles.cardContainer}>
							<Text style={styles.titleText}>
								{props.activity.serviceProvider}
							</Text>
							<View style={styles.iconTxtGap}>
								<FontAwesomeIcon
									icon={faCalendar}
									size={14}
									color={Colors.primaryFont}
									style={styles.iconStyle}
								/>
								<Text style={styles.dateTimeTxt}>
									{moment
										.utc(props.activity.datetime)
										.format("D MMMM YYYY, dddd")}
								</Text>
							</View>
							{typeof props.activity.time !== "undefined" ? (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginTop: 5,
									}}
								>
									<FontAwesomeIcon
										icon={faClock}
										size={14}
										color={Colors.primaryFont}
										style={styles.iconStyle}
									/>

									<Text style={styles.dateTimeTxt}>
										{moment.utc(props.activity.datetime).format("HH:mm")}
									</Text>
								</View>
							) : null}
						</Card>
					) : props.activity.activity_slug === Constant.HOTEL_SLUG ? (
						<Card style={styles.cardContainer}>
							<Text style={styles.titleText}>{props.activity.hotelName}</Text>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginTop: 5,
								}}
							>
								<View>
									<Text style={styles.checkInCheckOutTxt}>{"Check-In"}</Text>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<FontAwesomeIcon
											icon={faCalendar}
											size={14}
											color={Colors.primaryFont}
											style={styles.iconStyle}
										/>
										<Text style={styles.dateTimeTxt}>
											{`${moment
												.utc(props.activity.checkInDate)
												.format("D MMMM, YYYY")}`}
										</Text>
									</View>
								</View>
								<View>
									<Text style={styles.checkInCheckOutTxt}>{"Check-Out"}</Text>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<FontAwesomeIcon
											icon={faCalendar}
											size={14}
											color={Colors.primaryFont}
											style={styles.iconStyle}
										/>
										<Text style={styles.dateTimeTxt}>
											{`${moment
												.utc(props.activity.checkOutDate)
												.format("D MMMM, YYYY")}`}
										</Text>
									</View>
								</View>
							</View>
							<View style={styles.iconTxtGap}>
								<FontAwesomeIcon
									icon={faClock}
									size={14}
									color={Colors.primaryFont}
									style={styles.iconStyle}
								/>

								<Text style={styles.dateTimeTxt}>
									{moment.utc(props.activity.datetime).format("HH:mm")}
								</Text>
							</View>
						</Card>
					) : props.activity.activity_slug === Constant.EVENT_SLUG ? (
						<Card style={styles.cardContainer}>
							<Text style={styles.titleText}>{props.activity.eventName}</Text>
							<View style={styles.iconTxtGap}>
								<FontAwesomeIcon
									icon={faLocationDot}
									size={14}
									color={Colors.primaryFont}
									style={styles.iconStyle}
								/>
								<Text style={styles.dateTimeTxt}>
									{props.activity.eventLocation}
								</Text>
							</View>
							<View style={styles.iconTxtGap}>
								<FontAwesomeIcon
									icon={faCalendar}
									size={14}
									color={Colors.primaryFont}
									style={styles.iconStyle}
								/>
								<Text style={styles.dateTimeTxt}>
									{moment
										.utc(props.activity.datetime)
										.format("D MMMM YYYY, dddd")}
								</Text>
							</View>
							<View style={styles.iconTxtGap}>
								<FontAwesomeIcon
									icon={faClock}
									size={14}
									color={Colors.primaryFont}
									style={styles.iconStyle}
								/>

								<Text style={styles.dateTimeTxt}>
									{moment.utc(props.activity.datetime).format("HH:mm")}
								</Text>
							</View>
						</Card>
					) : props.activity.activity_slug === ProductCategory.LOUNGE ? (
						<>
							{props.isCancelled !== null && props.isCancelled ? (
								<Card
									style={[
										styles.cardContainer,
										{
											borderStyle: "dashed",
											borderColor: Colors.danger,
											borderRadius: 4,
											backgroundColor: "rgba(220, 53, 69, 0.1)",
										},
									]}
									onPress={props.onPress}
								>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							) : (
								<Card style={styles.cardContainer} onPress={props.onPress}>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							)}
						</>
					) : props.activity.activity_slug ===
					  ProductCategory.MEET_AND_GREET ? (
						<>
							{props.isCancelled !== null && props.isCancelled ? (
								<Card
									style={[
										styles.cardContainer,
										{
											borderStyle: "dashed",
											borderColor: Colors.danger,
											borderRadius: 4,
											backgroundColor: "rgba(220, 53, 69, 0.1)",
										},
									]}
									onPress={props.onPress}
								>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							) : (
								<Card style={styles.cardContainer} onPress={props.onPress}>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							)}
						</>
					) : props.activity.activity_slug ===
					  ProductCategory.MOBILITY_ASSIST ? (
						<>
							{props.isCancelled !== null && props.isCancelled ? (
								<Card
									style={[
										styles.cardContainer,
										{
											borderStyle: "dashed",
											borderColor: Colors.danger,
											borderRadius: 4,
											backgroundColor: "rgba(220, 53, 69, 0.1)",
										},
									]}
									onPress={props.onPress}
								>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							) : (
								<Card style={styles.cardContainer} onPress={props.onPress}>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							)}
						</>
					) : props.activity.activity_slug === ProductCategory.PORTER ? (
						<>
							{props.isCancelled !== null && props.isCancelled ? (
								<Card
									style={[
										styles.cardContainer,
										{
											borderStyle: "dashed",
											borderColor: Colors.danger,
											borderRadius: 4,
											backgroundColor: "rgba(220, 53, 69, 0.1)",
										},
									]}
									onPress={props.onPress}
								>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							) : (
								<Card style={styles.cardContainer} onPress={props.onPress}>
									<>
										<Text style={[styles.titleText, { marginBottom: 2 }]}>
											{`${props.activity.activity_name}`}
										</Text>
										<Text style={styles.productCategoryTxt}>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.startTime, "HH:mm:ss").format(
													"HH:mm"
												)} - ${moment(
													props.activity.endTime,
													"HH:mm:ss"
												).format("HH:mm")}`}
											</Text>
										</View>
									</>
								</Card>
							)}
						</>
					) : props.activity.activity_slug === ProductCategory.CAR_RENTAL ? (
						<>
							{props.isCancelled !== null && props.isCancelled ? (
								<Card
									style={[
										styles.cardContainer,
										{
											borderStyle: "dashed",
											borderColor: Colors.danger,
											borderRadius: 4,
											backgroundColor: "rgba(220, 53, 69, 0.1)",
										},
									]}
									onPress={props.onPress}
								>
									<>
										<Text
											style={[styles.titleText, { marginBottom: 2 }]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{`${props.activity.activity_name}`}
										</Text>
										<Text
											style={[styles.productCategoryTxt, { marginBottom: 2 }]}
										>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.datetime).format("HH:mm")} `}
											</Text>
										</View>
									</>
								</Card>
							) : (
								<Card style={[styles.cardContainer]} onPress={props.onPress}>
									<>
										<Text
											style={[styles.titleText, { marginBottom: 2 }]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{`${props.activity.activity_name}`}
										</Text>
										<Text
											style={[styles.productCategoryTxt, { marginBottom: 2 }]}
										>
											{toUpperCaseWord(
												props.activity.activity_slug
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faCalendar}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>
											<Text style={styles.dateTimeTxt}>
												{moment
													.utc(props.activity.datetime)
													.format("D MMMM YYYY, dddd")}
											</Text>
										</View>
										<View style={styles.iconTxtGap}>
											<FontAwesomeIcon
												icon={faClock}
												size={14}
												color={Colors.primaryFont}
												style={styles.iconStyle}
											/>

											<Text style={styles.dateTimeTxt}>
												{`${moment(props.activity.datetime).format("HH:mm")} `}
											</Text>
										</View>
									</>
								</Card>
							)}
						</>
					) : null}

					{/* {props.departureGate !== null ? (
						<View
							style={{
								flexDirection: "row",
								// borderWidth: 1,
								justifyContent: "space-between",
							}}
						>
							<View>
								{props.description.map((desc: string, i: number) => (
									<Text
										key={`${props.cityId}_desc${i}`}
										style={styles.activitiyDesc}
									>
										{desc}
									</Text>
								))}
							</View>
							<Text
								style={styles.departureGateTxt}
							>{`Gate: ${props.departureGate}`}</Text>
						</View>
					) : (
						<>
							{props.description.map((desc: string, i: number) => (
								<Text
									key={`${props.cityId}_desc${i}`}
									style={styles.activitiyDesc}
								>
									{desc}
								</Text>
							))}
						</>
					)}  */}
				</TouchableOpacity>
			}
		>
			<MenuItem
				onPress={gotoEditActivity}
				textStyle={styles.menuText}
				style={styles.menu}
			>
				{"Edit"}
			</MenuItem>
			<MenuItem
				onPress={deleteActivity}
				textStyle={styles.menuText}
				style={styles.menu}
			>
				{"Delete"}
			</MenuItem>
		</Menu>
	);
};

export default TourActivity;
