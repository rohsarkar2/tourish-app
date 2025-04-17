import React from "react";
import { Text, StyleSheet, View, ScrollView } from "react-native";
import moment from "moment-timezone";
import { getFlightList } from "../../services/ApiService";
import { getFlightDelay } from "../../utils/Util";
import Colors from "../../configs/Colors";
import Loader from "../Loader";
import NoResult from "../NoResult";
import LocalizedText from "../../resources/LocalizedText";

type Props = {
	airportId: string;
	iataCode: string;
	timeZone: string;
};

type States = {
	flightData: any[];
	flightDataSource: any[];
	flightLoading: boolean;
};

export default class ArrivalsTab extends React.Component<Props, States> {
	private scroller: React.RefObject<ScrollView>;

	constructor(props: Props) {
		super(props);
		this.state = {
			flightData: [],
			flightDataSource: [],
			flightLoading: true,
		};

		this.scroller = React.createRef();
	}

	componentDidMount = () => {
		this.fetchFlightList();
	};

	fetchFlightList = () => {
		const reqData = {
			airportId: this.props.airportId,
			iataCode: this.props.iataCode,
			type: "arrival",
		};
		getFlightList(reqData)
			.then((response) => {
				if (Array.isArray(response)) {
					const { timeZone } = this.props;
					const currentTime: moment.Moment = moment(new Date()).tz(timeZone);
					const arrayIndex = (response || []).findIndex(
						(item: any, index: number) => {
							let status: boolean = false;
							const index2 = index + 1;
							if (index2 < response.length) {
								const firstElementTime: moment.Moment = moment(
									item.arrival.scheduledTime
								).tz(timeZone);
								const secElementTime: moment.Moment = moment(
									response[index2].arrival.scheduledTime
								).tz(timeZone);
								status = moment(currentTime).isBetween(
									firstElementTime,
									secElementTime
								);
							} else {
								const firstElementTime: moment.Moment = moment(
									response[index - 1].arrival.scheduledTime
								).tz(timeZone);
								const secElementTime: moment.Moment = moment(
									item.arrival.scheduledTime
								).tz(timeZone);
								status = moment(currentTime).isBetween(
									firstElementTime,
									secElementTime
								);
							}

							return status;
						}
					);

					this.setState(
						{
							flightData: response,
							flightLoading: false,
						},
						() => {
							setTimeout(() => {
								this.scrollTo(arrayIndex);
							}, 250);
						}
					);
				} else {
					this.setState({
						flightLoading: false,
						flightData: [],
					});
				}
			})
			.catch((error) => {
				this.setState({ flightLoading: false });
			});
	};

	scrollTo = (index: number) => {
		let scrollYPos = index * 55;
		this.scroller &&
			this.scroller.current?.scrollTo({ x: 0, y: scrollYPos, animated: true });
	};

	render = () => {
		return this.state.flightLoading ? (
			<Loader style={{ flex: 1, backgroundColor: Colors.white }} />
		) : this.state.flightData.length == 0 ? (
			<NoResult
				title={LocalizedText.NO_RESULR_FOUND}
				style={{
					flex: 0.6,
				}}
			/>
		) : (
			<View style={styles.container}>
				<ScrollView showsVerticalScrollIndicator={false} ref={this.scroller}>
					{this.state.flightData.map((item, index) => {
						let delay = getFlightDelay(item.arrival.delay);
						return (
							<View key={index.toString()} style={styles.card}>
								<View
									style={{
										flexDirection: "row",
									}}
								>
									<View style={{ width: "40%" }}>
										<Text
											style={styles.time}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{moment(item.arrival.scheduledTime)
												.tz(this.props.timeZone)
												.format("HH:mm")}
										</Text>
									</View>
									<View style={{ width: "30%", alignItems: "center" }}>
										<Text style={styles.title} numberOfLines={1}>
											{item.departure.iataCode}
										</Text>
									</View>
									<View style={{ width: "30%", alignItems: "flex-end" }}>
										<Text
											style={styles.terminal}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item.arrival.terminal !== null
												? `T${item.arrival.terminal}`
												: "-"}
										</Text>
									</View>
								</View>

								<View
									style={{
										flexDirection: "row",
									}}
								>
									<View style={{ width: "40%" }}>
										<Text
											style={styles.date}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{moment(item.departure.scheduledTime)
												.tz(this.props.timeZone)
												.format("HH:mm")}
										</Text>
									</View>
									<View style={{ width: "30%", alignItems: "center" }}>
										<Text
											style={[styles.iataCode]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item.flight.iataNumber}
										</Text>
									</View>
									<View style={{ width: "30%" }}>
										<Text
											style={[
												styles.flightStatus,
												{
													color:
														item.status === "scheduled"
															? Colors.warning
															: Colors.black,
												},
											]}
											numberOfLines={1}
											ellipsizeMode="tail"
										>
											{item.status.charAt(0).toUpperCase() +
												item.status.slice(1)}
										</Text>

										{delay !== null ? (
											<Text
												style={[styles.expectedTime]}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{`(Delay ${delay})`}
											</Text>
										) : null}
									</View>
								</View>
							</View>
						);
					})}
				</ScrollView>
			</View>
		);
		/*return (
			<View style={[styles.container]}>
				{this.state.flightLoading ? (
					<Loader />
				) : this.state.flightData.length == 0 ? (
					<NoResult
						title={LocalizedText.NO_RESULR_FOUND}
						style={{ flex: 0.6 }}
					/>
				) : (
					<ScrollView showsVerticalScrollIndicator={false} ref={this.scroller}>
						{this.state.flightData.map((item, index) => {
							let delay = getFlightDelay(item.arrival.delay);
							return (
								<View key={index.toString()} style={styles.card}>
									<View
										style={{
											flexDirection: "row",
										}}
									>
										<View style={{ width: "40%" }}>
											<Text
												style={styles.time}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{moment(item.arrival.scheduledTime)
													.tz(this.props.timeZone)
													.format("HH:mm")}
											</Text>
										</View>
										<View style={{ width: "30%", alignItems: "center" }}>
											<Text style={styles.title} numberOfLines={1}>
												{item.departure.iataCode}
											</Text>
										</View>
										<View style={{ width: "30%", alignItems: "flex-end" }}>
											<Text
												style={styles.terminal}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{item.arrival.terminal !== null
													? `${"T" + item.arrival.terminal}`
													: "-"}
											</Text>
										</View>
									</View>

									<View
										style={{
											flexDirection: "row",
										}}
									>
										<View style={{ width: "40%" }}>
											<Text
												style={styles.date}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{moment(item.departure.scheduledTime)
													.tz(this.props.timeZone)
													.format("HH:mm")}
											</Text>
										</View>
										<View style={{ width: "30%", alignItems: "center" }}>
											<Text
												style={[styles.iataCode]}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{item.flight.iataNumber}
											</Text>
										</View>
										<View style={{ width: "30%" }}>
											<Text
												style={[
													styles.flightStatus,
													{
														color:
															item.status === "scheduled"
																? Colors.warning
																: Colors.black,
													},
												]}
												numberOfLines={1}
												ellipsizeMode="tail"
											>
												{item.status.charAt(0).toUpperCase() +
													item.status.slice(1)}
											</Text>

											{delay !== null ? (
												<Text
													style={[styles.expectedTime]}
													numberOfLines={1}
													ellipsizeMode="tail"
												>
													{`(Delay ${delay})`}
												</Text>
											) : null}
										</View>
									</View>
								</View>
							);
						})}
					</ScrollView>
				)}
			</View>
		);*/
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	card: {
		justifyContent: "center",
		height: 55,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		paddingHorizontal: 25,
	},
	title: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
	},
	time: {
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginLeft: 5,
	},
	date: {
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginLeft: 5,
	},
	expectedTime: {
		fontSize: 11,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.9,
		textAlign: "right",
	},
	iataCode: {
		color: Colors.secondary,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
	},
	terminal: {
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginLeft: 5,
	},
	flightStatus: {
		textAlign: "right",
		fontSize: 13,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginLeft: 5,
	},
	loadMoreBtn: {
		width: "100%",
		height: 50,
		backgroundColor: Colors.white,
		alignItems: "center",
		justifyContent: "center",
	},
	loadMoreTxt: {
		color: Colors.secondary,
		textDecorationLine: "underline",
		fontSize: 16,
		lineHeight: 20,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
	},
});
