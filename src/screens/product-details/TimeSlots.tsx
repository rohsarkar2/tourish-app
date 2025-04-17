import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
} from "react-native";
//@ts-ignore
import Counter from "react-native-counters";
import { Calendar, DateData } from "react-native-calendars";
import moment from "moment-timezone";
import Snackbar from "react-native-snackbar";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	Loader,
	BottomSheet,
	NoResult,
	OverlayLoader,
} from "../../components";
import { TimeSlotsScreenProps } from "../../navigation/NavigationTypes";
import LocalizedText from "../../resources/LocalizedText";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import ProductService from "../../services/ProductService";
import CartService from "../../services/CartService";
import AppContext, { UserDataModel } from "../../context/AppContext";

type States = {
	productId: string;
	productName: string;
	startDate: string;
	endtDate: string;
	sellEndDate: string;
	sellEndTime: string;
	selectedDate: string;
	slots: Array<any>;
	selectedSlot: null | any;
	quantity: number;
	isLoading: boolean;
	isModalOpen: boolean;
	showOverlayModal: boolean;
};

export default class TimeSlots extends React.Component<
	TimeSlotsScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private focusListner: any;

	constructor(props: any) {
		super(props);

		const toady = moment().format("YYYY-MM-DD");
		const serviceStartDate =
			typeof this.props.route.params !== "undefined"
				? this.props.route.params.startDate
				: toady;
		let selectedDate = toady;

		if (
			moment(serviceStartDate, "YYYY-MM-DD").isAfter(
				moment(toady, "YYYY-MM-DD")
			)
		) {
			selectedDate = serviceStartDate;
		}

		this.state = {
			productId: this.props.route.params.productId,
			productName: this.props.route.params.productName,
			startDate: serviceStartDate,
			endtDate: this.props.route.params.endtDate,
			sellEndDate: this.props.route.params.sellEndDate,
			sellEndTime: this.props.route.params.sellEndTime,
			selectedDate: selectedDate,
			slots: [],
			selectedSlot: null,
			quantity: 1,
			isLoading: true,
			isModalOpen: false,
			showOverlayModal: false,
		};
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount = () => {
		this.focusListner();
	};

	onFocusScreen = () => {
		this.setState({ isLoading: true }, () => {
			this.loadSlots();
		});
	};

	onChangeDate = (date: DateData) => {
		this.setState({ isLoading: true, selectedDate: date.dateString }, () => {
			this.loadSlots();
		});
	};

	loadSlots = () => {
		const { userData } = this.context;
		const reqData = {
			productId: this.state.productId,
			date: moment.utc(this.state.selectedDate).format("YYYY-MM-DD"),
			toCurrency: userData?.currency.code,
		};

		ProductService.getTimeSlots(reqData)
			.then((response: any) => {
				this.setState({ slots: response.data, isLoading: false });
			})
			.catch((error) => {
				this.setState({ isLoading: false });
			});
	};

	openModal = (item: any) => {
		this.setState({
			selectedSlot: item,
			isModalOpen: true,
		});
	};

	closeModal = () => {
		this.setState({
			isModalOpen: false,
			selectedSlot: null,
		});
	};

	onChangeQuantity = (value: number, type: any) => {
		this.setState({ quantity: value });
	};

	// onCheckout = () => {
	// 	this.setState({ isModalOpen: false }, () => {
	// 		const { selectedSlot } = this.state;
	// 		const amount =
	// 			Number(selectedSlot.price.amount) * Number(this.state.quantity);
	// 		setTimeout(() => {
	// 			this.props.navigation.navigate("Payment", {
	// 				productId: this.props.route.params.productId,
	// 				orderAmount: Number(amount.toFixed(2)),
	// 				currency: selectedSlot.price.currency,
	// 				slotId: selectedSlot._id,
	// 				capacity: this.state.quantity,
	// 				date: moment(this.state.selectedDate).format("YYYY-MM-DD"),
	// 			});
	// 		}, 300);
	// 	});
	// };

	onAddToCart = () => {
		this.setState({ isModalOpen: false }, () => {
			const { selectedSlot, selectedDate, quantity } = this.state;
			setTimeout(() => {
				this.setState({ showOverlayModal: true }, () => {
					const payload = {
						productId: this.props.route.params.productId,
						slotId: selectedSlot._id,
						currencyCode: selectedSlot.price.currency,
						price: Number(selectedSlot.price.amount),
						quantity: Number(quantity),
						bookingDate: selectedDate,
					};

					CartService.add(payload)
						.then((response) => {
							const resData = response.data;
							this.setState({ showOverlayModal: false }, () => {
								const { userData } = this.context;
								// const totalCartItems: number =
								// 	Number(userData?.total_cart_items) + 1;
								this.context.setUserData({
									...(userData as UserDataModel),
									total_cart_items: resData.cartItem,
								});

								setTimeout(() => {
									Snackbar.show({
										text: LocalizedText.ITEM_ADDED_TO_YOUR_CART,
										duration: Snackbar.LENGTH_LONG,
										action: {
											text: "View",
											textColor: Colors.secondary,
											onPress: this.gotoCart,
										},
									});
								}, 350);
							});
						})
						.catch((error) => {
							this.setState({ showOverlayModal: false });
						});
				});
			}, 250);
		});
	};

	gotoCart = () => {
		this.props.navigation.navigate("Cart");
	};

	render = () => (
		<Container>
			<Header title={this.state.productName} />
			<WhiteContainer style={{ paddingHorizontal: 0, paddingTop: 0 }}>
				<ScrollView
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<Calendar
						style={{
							width: "100%",
							height: 350,
							borderTopLeftRadius: 30,
							borderTopRightRadius: 30,
						}}
						hideExtraDays={true}
						allowSelectionOutOfRange={false}
						initialDate={this.state.selectedDate}
						onDayPress={this.onChangeDate}
						markedDates={{
							[this.state.selectedDate]: {
								selected: true,
								disableTouchEvent: true,
							},
						}}
						maxDate={this.state.sellEndDate}
						minDate={
							moment().isSameOrBefore(
								moment(this.state.startDate, "YYYY-MM-DD")
							)
								? this.state.startDate
								: moment().format("YYYY-MM-DD")
						}
						theme={{
							backgroundColor: Colors.white,
							calendarBackground: Colors.white,
							selectedDayBackgroundColor: Colors.primaryBtn,
							selectedDayTextColor: Colors.white,
							todayTextColor: Colors.secondary,
							dayTextColor: Colors.primaryFont,
							textDisabledColor: "#d9e1e8",
							arrowColor: Colors.primaryBtn,
							disabledArrowColor: "#d9e1e8",
							monthTextColor: Colors.primaryFont,
							indicatorColor: Colors.primaryBtn,
							textDayFontFamily: "Roboto-Regular",
							textMonthFontFamily: "Roboto-Regular",
							textDayHeaderFontFamily: "Roboto-Regular",
							textDayFontWeight: "400",
							textMonthFontWeight: "400",
							textDayHeaderFontWeight: "400",
							textDayFontSize: 14,
							textMonthFontSize: 14,
							textDayHeaderFontSize: 14,
						}}
					/>

					{this.state.isLoading ? (
						<Loader />
					) : this.state.slots.length > 0 ? (
						<View style={styles.warpView}>
							{this.state.slots.map((item: any, i: number) => {
								const { sellEndDate, sellEndTime } = this.state;
								const selectedDate = moment(this.state.selectedDate).format(
									"YYYY-MM-DD"
								);
								let today = moment().format("YYYY-MM-DD");
								let now = moment()
									.add(Number(this.props.route.params.minimumBookingHour), "h")
									.format("HH:mm:ss");
								let now2 = moment()
									.add(Number(this.props.route.params.minimumBookingHour), "h")
									.format("YYYY-MM-DD");
								if (
									moment(now2, "YYYY-MM-DD").isAfter(
										moment(today, "YYYY-MM-DD")
									)
								) {
									today = now2;
								}
								let currentDateTime = today + " " + now;
								let slotStartDateTime = `${selectedDate} ${item.start}:00:00`;

								let isBooked =
									parseInt(item.totalCapacity) - parseInt(item.totalBooked) <=
									0;

								let isExpired = moment(selectedDate, "YYYY-MM-DD").isBefore(
									moment(today, "YYYY-MM-DD")
								);

								if (
									moment(selectedDate, "YYYY-MM-DD").isSame(
										moment(today, "YYYY-MM-DD")
									)
								) {
									isExpired = moment(
										slotStartDateTime,
										"YYYY-MM-DD HH:mm:ss"
									).isSameOrBefore(
										moment(currentDateTime, "YYYY-MM-DD HH:mm:ss")
									);
								}

								if (
									moment(selectedDate, "YYYY-MM-DD").isSame(
										moment(sellEndDate, "YYYY-MM-DD")
									)
								) {
									isExpired = moment(
										`${selectedDate} ${item.start}:00:00`,
										"YYYY-MM-DD HH:mm:ss"
									).isSameOrAfter(
										moment(
											`${sellEndDate} ${sellEndTime}`,
											"YYYY-MM-DD HH:mm:ss"
										)
									);
								}

								return (
									<TouchableOpacity
										disabled={isExpired ? true : false}
										key={item._id}
										activeOpacity={isBooked ? 1 : 0.5}
										onPress={
											isBooked ? undefined : this.openModal.bind(this, item)
										}
										style={[
											styles.slotBox,
											isExpired
												? {
														backgroundColor: Colors.lightGrey,
														borderColor: Colors.lightGrey,
												  }
												: null,
											isBooked ? styles.bookedChip : null,
										]}
									>
										<View
											style={{
												flexDirection: "row",
												alignItems: "center",
											}}
										>
											<Text
												style={[
													styles.slotTimeText,
													isExpired ? { opacity: 0.6 } : null,
													isBooked ? styles.bookedChipText : null,
													{ fontSize: 10 },
												]}
											>
												{item.start + " - " + item.end + " H"}
											</Text>
										</View>
										<Text
											style={[
												styles.chipText,
												isExpired ? { opacity: 0.5 } : null,
												isBooked ? styles.bookedChipText : null,
												{ fontSize: 10 },
											]}
										>
											{`${item.targetedPrice.currency} ${item.targetedPrice.amount}`}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					) : (
						<NoResult
							title="No data found"
							description="Slots not found on your selected date. Try another one."
						/>
					)}
				</ScrollView>
			</WhiteContainer>

			<BottomSheet
				isVisible={this.state.isModalOpen}
				title={LocalizedText.SLOT_DETAILS}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
				onClose={this.closeModal}
			>
				<View style={{ flex: 1, justifyContent: "space-between" }}>
					{this.state.selectedSlot !== null ? (
						<>
							<View style={{ paddingHorizontal: 20 }}>
								<View style={styles.descRow}>
									<Text style={styles.modalRegularText}>
										{LocalizedText.TIME}
									</Text>
									<Text style={styles.modalRegularText}>
										{`${this.state.selectedSlot.start} - ${this.state.selectedSlot.end} H`}
									</Text>
								</View>

								<View style={styles.descRow}>
									<Text style={styles.modalRegularText}>
										{`Price (${this.state.selectedSlot.price.currency})`}
									</Text>
									<Text style={styles.modalRegularText}>
										{this.state.selectedSlot.price.amount}
									</Text>
								</View>

								<View style={styles.descRow}>
									<Text style={styles.modalRegularText}>
										{LocalizedText.AVAILABLE}
									</Text>
									<Text style={styles.modalRegularText}>
										{parseInt(this.state.selectedSlot.totalCapacity) -
											parseInt(this.state.selectedSlot.totalBooked)}
									</Text>
								</View>

								<View style={styles.descRow}>
									<Text style={styles.modalRegularText}>
										{LocalizedText.QUANTITY}
									</Text>
									<Counter
										start={1}
										min={1}
										max={
											parseInt(this.state.selectedSlot.totalCapacity) -
											parseInt(this.state.selectedSlot.totalBooked)
										}
										onChange={this.onChangeQuantity}
										buttonStyle={{
											minWidth: 20,
											minHeight: 20,
											alignItems: "center",
											justifyContent: "center",
											borderColor: Colors.secondaryFont,
											borderRadius: 90,
										}}
										buttonTextStyle={styles.modalRegularText}
										countTextStyle={styles.modalRegularText}
									/>
								</View>

								<View
									style={[
										styles.descRow,
										{
											borderTopWidth: 1,
											borderColor: Colors.lightBorder,
											paddingTop: 5,
										},
									]}
								>
									<Text style={styles.modalBoldText}>
										{`${LocalizedText.SUB_TOTAL} (${this.state.selectedSlot.targetedPrice.currency})`}
									</Text>
									<Text style={styles.modalBoldText}>
										{(
											this.state.selectedSlot.targetedPrice.amount *
											this.state.quantity
										).toFixed(2)}
									</Text>
								</View>
							</View>
							<View
								style={{
									width: "100%",
									paddingHorizontal: 20,
									paddingBottom: 15,
								}}
							>
								<Button
									title={LocalizedText.ADD_TO_CART}
									onPress={this.onAddToCart}
								/>
							</View>
						</>
					) : null}
				</View>
			</BottomSheet>
			<OverlayLoader visible={this.state.showOverlayModal} />
		</Container>
	);
}

const styles = StyleSheet.create({
	warpView: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginVertical: 15,
		paddingHorizontal: 5,
	},
	slotBox: {
		height: 40,
		width: Math.floor((Constant.WINDOW_WIDTH - 50) / 4),
		marginVertical: 5,
		marginHorizontal: 5,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 90,
	},
	slotTimeText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 10,
		color: Colors.lightFont,
	},
	chipText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.secondaryFont,
		opacity: 0.6,
	},
	bookedChip: {
		borderWidth: 0,
		backgroundColor: "#445578",
	},
	bookedChipText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.white,
		opacity: 1,
	},
	noServiceChip: {
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		backgroundColor: Colors.lightGrey,
	},
	noServiceChipText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.secondaryFont,
		opacity: 0.5,
	},
	selectedChip: {
		borderColor: Colors.primary,
		backgroundColor: Colors.primary,
	},
	selectedChipText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 11,
		color: Colors.white,
		opacity: 1,
	},
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		backgroundColor: Colors.white,
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.55),
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		elevation: 5,
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	modalTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	modalRegularText: {
		fontSize: 15,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.9,
	},
	modalBoldText: {
		fontSize: 18,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		opacity: 0.9,
	},
	descRow: {
		flexDirection: "row",
		paddingVertical: 8,
		alignItems: "center",
		justifyContent: "space-between",
	},
});
