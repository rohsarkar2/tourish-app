import React from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { faXmark } from "@fortawesome/pro-solid-svg-icons/faXmark";
import { faExclamation } from "@fortawesome/pro-solid-svg-icons/faExclamation";
import { faInfo } from "@fortawesome/pro-solid-svg-icons/faInfo";
// @ts-ignore
import Image from "react-native-remote-svg";
import moment from "moment-timezone";
import Card from "./Card";
import Colors from "../configs/Colors";
import FlightStatus, {
	FlightStatusBackgroundColor,
	FlightStatusBorderColor,
	FlightStatusIconBackgroundColor,
	FlightStatusText,
} from "../configs/FlightStatus";
import Constant from "../configs/Constant";

type Props = {
	flightData: null | any;
	departureCity: string;
	arrivalCity: string;
	flightIataData: string;
	flightDuration: string;
	onAddtoTourbook?: (
		item: any,
		departureCity: string,
		arrivalCity: string
	) => void;
	style?: ViewStyle | Array<ViewStyle> | any;
};

const FlightDataCard: React.FC<Props> = (props) => {
	const getFlightStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case FlightStatus.ACTIVE:
				icon = faCheck;
				break;
			case FlightStatus.CANCELLED:
				icon = faXmark;
				break;
			case FlightStatus.DIVERTED:
				icon = faExclamation;
				break;
			case FlightStatus.DATA_NEEDED:
				icon = faExclamation;
				break;
			case FlightStatus.LANDED:
				icon = faCheck;
				break;
			case FlightStatus.NOT_OPERATIONAL:
				icon = faXmark;
				break;
			case FlightStatus.REDIRECTED:
				icon = faXmark;
				break;
			case FlightStatus.SCHEDULED:
				icon = faCheck;
				break;
			case FlightStatus.UNKNOWN:
				icon = faExclamation;
				break;
			default:
				break;
		}
		return icon;
	};

	const addtoTourbook = (
		item: any,
		departureCity: string,
		arrivalCity: string
	) => {
		if (
			typeof props.onAddtoTourbook !== "undefined" &&
			typeof props.onAddtoTourbook === "function"
		) {
			props.onAddtoTourbook(item, departureCity, arrivalCity);
		}
		// props.onAddtoTourbook(item, departureCity, arrivalCity);
	};

	let duration = moment.duration(props.flightDuration, "minutes");
	let hh =
		duration.years() * (365 * 24) +
		duration.months() * (30 * 24) +
		duration.days() * 24 +
		duration.hours();
	let mm = duration.minutes();

	return (
		<Card style={[styles.itemContainer, props.style]}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					paddingHorizontal: 4,
				}}
			>
				<View style={{ flex: 0.65 }}>
					<Text style={[styles.flightDateTxt, { marginBottom: 2 }]}>
						{moment
							.utc(props.flightData.departureDate.dateLocal)
							.format("D MMMM YYYY, dddd")}
					</Text>
					<Text
						style={styles.cityToCityTxt}
					>{`${props.departureCity} to ${props.arrivalCity}`}</Text>
				</View>
				<View style={{ flex: 0.35 }}>
					<Text style={[styles.flightCodeTxt, { marginBottom: 2 }]}>
						{`${props.flightData.carrierFsCode} ${props.flightData.flightNumber}`}
					</Text>
					<Text
						style={styles.flightNameTxt}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{props.flightIataData}
					</Text>
				</View>
			</View>
			<View
				style={{
					borderBottomWidth: 1,
					borderStyle: "dotted",
					borderColor: Colors.mediumGrey,
					opacity: 0.3,
					marginTop: 5,
				}}
			/>
			<View
				style={{
					flex: 1,
					flexDirection: "row",
					minHeight: 80,
					height: "auto",
					marginTop: 10,
				}}
			>
				<View style={{ flex: 1 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							paddingHorizontal: 5,
						}}
					>
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<Text style={styles.airportCodeTxt}>
								{props.flightData.departureAirportFsCode}
							</Text>
							{/* <TouchableOpacity style={styles.aiportInfoButton}>
								<FontAwesomeIcon
									icon={faInfo}
									size={8}
									color={Colors.darkPrimary}
								/>
							</TouchableOpacity> */}
						</View>

						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<Text style={styles.airportCodeTxt}>
								{props.flightData.arrivalAirportFsCode}
							</Text>
							{/* <TouchableOpacity style={styles.aiportInfoButton}>
								<FontAwesomeIcon
									icon={faInfo}
									size={8}
									color={Colors.darkPrimary}
								/>
							</TouchableOpacity> */}
						</View>
					</View>

					<View
						style={{
							flexDirection: "row",
							paddingHorizontal: 5,
							justifyContent: "space-between",
							marginTop: 8,
						}}
					>
						<View style={{ flex: 0.2 }}>
							<Text style={styles.flightTimeTxt}>
								{moment
									.utc(props.flightData.departureDate.dateLocal)
									.format("HH:mm")}
							</Text>
						</View>

						<View
							style={{
								position: "relative",
								flex: 1,
								borderTopWidth: 1,
								borderColor: Colors.primaryBg,
								marginTop: 8,
							}}
						>
							<Text
								style={[styles.flightDurationtxt, { textAlign: "center" }]}
							>{`${hh}h ${mm}m`}</Text>
						</View>
						{props.flightData.status === FlightStatus.LANDED ? (
							<View style={{ position: "absolute", top: -7.2, right: 48 }}>
								<Image
									source={{
										uri: `data:image/svg+xml;utf8,
							<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
								<title>plane (3)-svg</title>
								<style>
									.s0 { fill: #15BDD8 } 
								</style>
								<g id="Layer">
									<g id="Layer">
										<path id="Layer" class="s0" d="m176.8 555.3l49 0.2 157.3-211.7c41.3 0.8 83.1 0.9 125.6-0.3 50.3-2.2 91-21.5 91.1-42.5 0.1-21-40.5-40.6-90.8-43.2-42.5-1.4-84.3-1.6-125.5-1.1l-155.9-212.9-49-0.2 88.1 216.1c-66.2 2.5-131.9 5.5-197.9 7.7l-36.1-65.8-32.3-0.1 16.6 97.4-17.3 97.3 32.3 0.1 36.6-65.5c66 2.6 131.6 6.1 197.8 9.1z"/>
										<g id="Layer">
											<path id="Layer" class="s0" d="m351.6 139.1l-0.1 39.7-66.7-0.2 0.1-39.7z"/>
											<path id="Layer" class="s0" d="m350.6 421.4l-0.2 39.7-66.6-0.3 0.1-39.7z"/>
										</g>
									</g>
								</g>
							</svg>`,
									}}
									style={{
										width: 30,
										height: 30,
									}}
								/>
							</View>
						) : (
							<View style={{ position: "absolute", top: -7.2, left: 46 }}>
								<Image
									source={{
										uri: `data:image/svg+xml;utf8,
							<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
								<title>plane (3)-svg</title>
								<style>
									.s0 { fill: #15BDD8 } 
								</style>
								<g id="Layer">
									<g id="Layer">
										<path id="Layer" class="s0" d="m176.8 555.3l49 0.2 157.3-211.7c41.3 0.8 83.1 0.9 125.6-0.3 50.3-2.2 91-21.5 91.1-42.5 0.1-21-40.5-40.6-90.8-43.2-42.5-1.4-84.3-1.6-125.5-1.1l-155.9-212.9-49-0.2 88.1 216.1c-66.2 2.5-131.9 5.5-197.9 7.7l-36.1-65.8-32.3-0.1 16.6 97.4-17.3 97.3 32.3 0.1 36.6-65.5c66 2.6 131.6 6.1 197.8 9.1z"/>
										<g id="Layer">
											<path id="Layer" class="s0" d="m351.6 139.1l-0.1 39.7-66.7-0.2 0.1-39.7z"/>
											<path id="Layer" class="s0" d="m350.6 421.4l-0.2 39.7-66.6-0.3 0.1-39.7z"/>
										</g>
									</g>
								</g>
							</svg>`,
									}}
									style={{
										width: 30,
										height: 30,
									}}
								/>
							</View>
						)}

						<View style={{ flex: 0.2 }}>
							<Text style={[styles.flightTimeTxt, { textAlign: "right" }]}>
								{moment
									.utc(props.flightData.arrivalDate.dateLocal)
									.format("HH:mm")}
							</Text>
						</View>
					</View>

					<View
						style={{ flexDirection: "row", justifyContent: "space-between" }}
					>
						<View style={{ paddingRight: 2, marginTop: 10 }}>
							{typeof props.flightData.airportResources.departureTerminal !==
								"undefined" &&
							props.flightData.airportResources.departureTerminal !== null ? (
								<Text
									style={[styles.terminalValueTxt]}
								>{`Terminal ${props.flightData.airportResources.departureTerminal
									.toLowerCase()
									.replace("t", "")}`}</Text>
							) : (
								<Text style={[styles.terminalValueTxt]}>{`Terminal N/A`}</Text>
							)}
							{typeof props.flightData.airportResources.departureGate !==
								"undefined" &&
							props.flightData.airportResources.departureGate !== null ? (
								<Text
									style={[styles.terminalValueTxt]}
								>{`Gate ${props.flightData.airportResources.departureGate}`}</Text>
							) : (
								<Text style={[styles.terminalValueTxt]}>{`Gate N/A`}</Text>
							)}
						</View>
						<View style={{ paddingRight: 5, marginTop: 10 }}>
							{typeof props.flightData.airportResources.arrivalTerminal !==
								"undefined" &&
							props.flightData.airportResources.arrivalTerminal !== null ? (
								<Text
									style={[styles.terminalValueTxt, { textAlign: "right" }]}
								>{`Terminal ${props.flightData.airportResources.arrivalTerminal
									.toLowerCase()
									.replace("t", "")}`}</Text>
							) : (
								<Text style={[styles.terminalValueTxt, { textAlign: "right" }]}>
									{" "}
									{`Terminal N/A`}
								</Text>
							)}
							{typeof props.flightData.airportResources.arrivalGate !==
								"undefined" &&
							props.flightData.airportResources.arrivalGate !== null ? (
								<Text
									style={[styles.terminalValueTxt, { textAlign: "right" }]}
								>{`Gate ${props.flightData.airportResources.arrivalGate}`}</Text>
							) : (
								<Text
									style={[styles.terminalValueTxt, { textAlign: "right" }]}
								>{`Gate N/A`}</Text>
							)}
						</View>
					</View>
				</View>
			</View>

			<View
				style={{
					borderBottomWidth: 1,
					borderStyle: "dotted",
					borderColor: Colors.mediumGrey,
					opacity: 0.3,
					marginVertical: 5,
				}}
			/>

			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				{props.flightData.status === FlightStatus.SCHEDULED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.SCHEDULED,
								borderColor: FlightStatusBorderColor.SCHEDULED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.SCHEDULED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>
							{FlightStatusText.SCHEDULED}
						</Text>
					</View>
				) : props.flightData.status === FlightStatus.ACTIVE ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.ACTIVE,
								borderColor: FlightStatusBorderColor.ACTIVE,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.ACTIVE,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>{FlightStatusText.ACTIVE}</Text>
					</View>
				) : props.flightData.status === FlightStatus.CANCELLED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.CANCELLED,
								borderColor: FlightStatusBorderColor.CANCELLED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.CANCELLED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>
							{FlightStatusText.CANCELLED}
						</Text>
					</View>
				) : props.flightData.status === FlightStatus.DIVERTED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.DIVERTED,
								borderColor: FlightStatusBorderColor.DIVERTED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.DIVERTED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>{FlightStatusText.DIVERTED}</Text>
					</View>
				) : props.flightData.status === FlightStatus.DATA_NEEDED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.DATA_NEEDED,
								borderColor: FlightStatusBorderColor.DATA_NEEDED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.DATA_NEEDED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>
							{FlightStatusText.DATA_NEEDED}
						</Text>
					</View>
				) : props.flightData.status === FlightStatus.LANDED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.LANDED,
								borderColor: FlightStatusBorderColor.LANDED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.LANDED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>{FlightStatusText.LANDED}</Text>
					</View>
				) : props.flightData.status === FlightStatus.NOT_OPERATIONAL ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.NOT_OPERATIONAL,
								borderColor: FlightStatusBorderColor.NOT_OPERATIONAL,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor:
										FlightStatusIconBackgroundColor.NOT_OPERATIONAL,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>
							{FlightStatusText.NOT_OPERATIONAL}
						</Text>
					</View>
				) : props.flightData.status === FlightStatus.REDIRECTED ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.REDIRECTED,
								borderColor: FlightStatusBorderColor.REDIRECTED,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.REDIRECTED,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>
							{FlightStatusText.REDIRECTED}
						</Text>
					</View>
				) : props.flightData.status === FlightStatus.UNKNOWN ? (
					<View
						style={[
							styles.statusBox,
							{
								backgroundColor: FlightStatusBackgroundColor.UNKNOWN,
								borderColor: FlightStatusBorderColor.UNKNOWN,
							},
						]}
					>
						<View
							style={[
								styles.statusIconBackground,
								{
									backgroundColor: FlightStatusIconBackgroundColor.UNKNOWN,
								},
							]}
						>
							<FontAwesomeIcon
								icon={getFlightStatusIcon(props.flightData.status)}
								size={14}
								color={Colors.white}
							/>
						</View>
						<Text style={[styles.statusText]}>{FlightStatusText.UNKNOWN}</Text>
					</View>
				) : null}

				{typeof props.onAddtoTourbook !== "undefined" ? (
					<TouchableOpacity
						style={styles.addtoTourbookBtn}
						onPress={() =>
							addtoTourbook(
								props.flightData,
								props.departureCity,
								props.arrivalCity
							)
						}
					>
						<FontAwesomeIcon
							icon={faPlus}
							size={14}
							color={Colors.primaryBtn}
							style={{ marginRight: 2 }}
						/>
						<Text style={styles.addtoTourbookBtnTxt}>{"Add to Tourbook"}</Text>
					</TouchableOpacity>
				) : null}
			</View>
		</Card>
	);
};

export default FlightDataCard;

const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 15,
		paddingHorizontal: 12,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 34,
		// marginVertical: 7,
	},
	flightCodeTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.secondaryFont,
		textAlign: "right",
	},
	cityToCityTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
	},
	airportCodeTxt: {
		fontFamily: "Roboto-Rehular",
		fontWeight: "400",
		fontSize: 18,
		color: Colors.primaryBg,
	},
	flightTimeTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
	},
	flightNameTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 13,
		color: Colors.secondaryFont,
		textAlign: "right",
	},
	flightDateTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.secondaryFont,
	},
	terminalValueTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.secondaryFont,
		marginLeft: 2,
	},
	addtoTourbookBtn: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
	},
	addtoTourbookBtnTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
		color: Colors.primaryBtn,
		lineHeight: 18,
	},
	flightDurationtxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.secondaryFont,
	},
	statusBox: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 25,
		alignItems: "center",
		height: 30,
		width: "auto",
		minWidth: 50,
		paddingHorizontal: 6,
		paddingRight: 10,
	},
	statusText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
		color: Colors.primaryFont,
		opacity: 0.6,
	},
	statusIconBackground: {
		justifyContent: "center",
		alignItems: "center",
		width: 20,
		height: 20,
		borderRadius: 50,
		marginRight: 5,
	},
	aiportInfoButton: {
		width: 15,
		height: 15,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.lightBorder,
		marginLeft: 4,
	},
});
