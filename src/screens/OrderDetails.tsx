import React from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableHighlight,
	// Image,
	FlatList,
	TouchableOpacity,
	Keyboard,
	Alert,
	BackHandler,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons/faPlus";
import { faSimCard } from "@fortawesome/pro-solid-svg-icons/faSimCard";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { faXmark } from "@fortawesome/pro-solid-svg-icons/faXmark";
import { faExclamation } from "@fortawesome/pro-solid-svg-icons/faExclamation";
import { faArrowRotateRight } from "@fortawesome/pro-solid-svg-icons/faArrowRotateRight";
import { faCar } from "@fortawesome/pro-solid-svg-icons/faCar";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons/faChevronRight";
import moment from "moment-timezone";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { writeFile, mkdir, DownloadDirectoryPath } from "react-native-fs";
import Snackbar from "react-native-snackbar";
//@ts-ignore
import Image from "react-native-remote-svg";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	QRCode,
	Button,
	BottomSheet,
	ListAvatar,
	AbsoluteLoader,
	RadioButton,
	InputField,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import ProductCategory from "../configs/ProductCategory";
import { OrderDetailsScreenProps } from "../navigation/NavigationTypes";
import {
	toUpperCaseWord,
	getEsimQrImageUrl,
	requestStoragePermission,
} from "../utils/Util";
import OrderService from "../services/OrderService";
import AppContext from "../context/AppContext";
import TourBookService from "../services/TourBookService";
import OrderStatus, {
	OrderStatusBackgroundColor,
	OrderStatusBorderColor,
	OrderStatusIconBackgroundColor,
} from "../configs/OrderStatus";
import ItemStatus from "./order-tabs/ItemStatus";
import CustomerReview from "./order-tabs/CustomerReview";
import MaterialTabs from "react-native-material-tabs";

const validationSchema = Yup.object().shape({
	journeyName: Yup.string().required(LocalizedText.ENTER_TOUR_BOOK_TITLE),
});

const cancelSchema = Yup.object().shape({
	cancelReasonId: Yup.string().required("Select a reason for cancellation"),
});

type RescheduleFormModel = {
	date: string;
	time: string;
	rescheduleReasonId: string;
};

type CancelFormModel = {
	cancelReasonId: string;
};

type States = {
	orderId: string;
	orderNumber: string;
	itemId: string;
	orderData: any | null;
	orderItems: Array<any>;
	orderItemData: any | null;
	otherItems: Array<any>;
	qrCodeValue: null | string;
	isLoading: boolean;
	tabItems: Array<string>;
	selectedTabIndex: number;
	appliedCoupons: Array<any>;
	tours: Array<any>;
	isLoadingTour: boolean;
	isTourListOpen: boolean;
	isNewTourFormOpen: boolean;
	isOverlayModalOpen: boolean;
	orderItemId: null | string;
	isLoadingReasons: boolean;
	isRescheduleModalOpen: boolean;
	rescheduleReasons: Array<any>;
	isCancelModalOpen: boolean;
	cancelReasons: Array<any>;
	rescheduleProductData: any | null;
	cancelProductData: any | null;
	bookingErrorMsg: null | string;
	isPaymentInfoModalOpen: boolean;
	isItemPriceModalOpen: boolean;
	isOrderPriceModalOpen: boolean;
	overallDiscount: any;
	orderCurrency: string;
	orderAmount: Number;
};

export default class OrderDetails extends React.Component<
	OrderDetailsScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private focusListner: any;
	private formikRef: React.RefObject<FormikProps<RescheduleFormModel>>;
	private formikRef2: React.RefObject<FormikProps<CancelFormModel>>;
	private backHandler: any;

	constructor(props: OrderDetailsScreenProps) {
		super(props);

		this.state = {
			orderId: props.route.params.orderId,
			orderNumber: props.route.params.orderNo,
			itemId: props.route.params.orderItemId,
			orderData: null,
			orderItems: [],
			orderItemData: null,
			otherItems: [],
			qrCodeValue: null,
			isLoading: true,
			tabItems: ["Status", "Reviews"],
			selectedTabIndex: 0,
			appliedCoupons: [],
			tours: [],
			isLoadingTour: false,
			isTourListOpen: false,
			isNewTourFormOpen: false,
			isOverlayModalOpen: false,
			orderItemId: null,
			isLoadingReasons: false,
			isRescheduleModalOpen: false,
			rescheduleReasons: [],
			isCancelModalOpen: false,
			cancelReasons: [],
			rescheduleProductData: null,
			cancelProductData: null,
			bookingErrorMsg: null,
			isPaymentInfoModalOpen: false,
			isItemPriceModalOpen: false,
			isOrderPriceModalOpen: false,
			overallDiscount: 0,
			orderCurrency: "",
			orderAmount: 0,
		};

		this.formikRef = React.createRef();
		this.formikRef2 = React.createRef();
	}

	componentDidMount = () => {
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.gotoBack
		);

		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
		// this.loadOrderDetails();
	};

	componentWillUnmount(): void {
		this.focusListner();
	}

	onFocusScreen = () => {
		this.loadOrderDetails();
	};

	loadOrderDetails = () => {
		const { orderId } = this.state;
		OrderService.getDetails(orderId)
			.then((response) => {
				const orderData = response.data;

				const orderItems: Array<any> = orderData.orderItems;
				// const items: Array<string> = [...this.state.tabItems];
				// if (orderItems.length > 1 && !items.includes("Others")) {
				// 	items.unshift("Others");
				// }

				const orderItemData: any = orderItems.find(
					(item: any) => item._id === this.props.route.params.orderItemId
				);

				const allOtherItems: Array<any> = orderItems.filter(
					(item: any) => item._id !== this.props.route.params.orderItemId
				);

				const vendorData: Array<string> = [];
				const allItems = Array.isArray(orderData.orderItems)
					? orderData.orderItems
					: [];
				const allAppliedCoupons: Array<any> = [];

				orderItems.forEach((item: any) => {
					if (item.product.category !== ProductCategory.E_SIM) {
						if (!vendorData.includes(item.seller._id)) {
							vendorData.push(item.seller._id);
						}
					}
				});

				if (orderData.coupon !== null) {
					const coupon: any = orderData.coupon;
					allAppliedCoupons.push({
						_id: coupon._id,
						code: coupon.code,
					});
				}
				allItems.forEach((item: any) => {
					const coupon = item.coupon;
					if (coupon !== null) {
						const index: number = allAppliedCoupons.findIndex(
							(element: any) => element._id === coupon._id
						);
						if (index === -1) {
							allAppliedCoupons.push({
								_id: coupon._id,
								code: coupon.code,
							});
						}
					}
				});

				let cartDiscount: number = 0;

				if (orderData.coupon !== null) {
					cartDiscount += orderData.coupon.discount;
				}

				let itemDiscount: number = 0;
				allItems.forEach((item: any) => {
					const coupon = item.coupon;
					if (coupon !== null) {
						itemDiscount += coupon.discount;
					}
				});

				let overallDiscount: number = 0;
				overallDiscount += cartDiscount + itemDiscount;

				let orderCurrencyCode: string = orderData.orderCurrency;
				let orderAmount: number = orderData.orderAmount;

				this.setState({
					orderData: orderData,
					orderItems: orderItems,
					orderCurrency: orderCurrencyCode,
					orderAmount: orderAmount,
					orderItemData: orderItemData,
					otherItems: allOtherItems,
					qrCodeValue:
						vendorData.length > 0
							? JSON.stringify({
									order_id: orderData._id,
									order_number: orderData.orderNumber,
									vendorData,
							  })
							: null,
					appliedCoupons: allAppliedCoupons,
					// tabItems: items,
					overallDiscount: overallDiscount,
					isLoading: false,
				});
			})
			.catch((error) => {
				this.setState({ isLoading: false });
			});
	};

	orderData = (orderId: any, orderItemId: any, orderNum: string) => {
		this.props.navigation.push("OrderDetails", {
			orderId: orderId,
			orderNo: orderNum,
			orderItemId: orderItemId,
		});
	};

	getOrderSummary = () => {
		const { orderData } = this.state;
		let subTotal = 0;
		// let discount = 0;

		if (orderData !== null) {
			// if (orderData.coupon !== null) {
			// 	discount += Number(orderData.coupon.discount);
			// }

			const orderItems: Array<any> = orderData.orderItems;
			orderItems.forEach((item: any) => {
				// if (item.coupon !== null) {
				// 	discount += Number(item.coupon.discount);
				// }
				subTotal += Number(item.targetedPrice.value);
			});
		}

		return { subTotal };
	};

	onOpenTourList = () => {
		const { userData } = this.context;
		this.setState(
			{
				isLoadingTour: true,
				isTourListOpen: true,
				isNewTourFormOpen: false,
				tours: [],
			},
			() => {
				TourBookService.getTourList(userData?._id as string)
					.then((response: any) => {
						this.setState({ tours: response.data, isLoadingTour: false });
					})
					.catch((error) => {
						this.setState({ tours: [], isLoadingTour: false });
					});
			}
		);
	};

	onCloseTourList = () => {
		this.setState({ isTourListOpen: false });
	};

	onOpenTourCreateForm = () => {
		this.setState({ isNewTourFormOpen: true });
	};

	onCloseJourneyCreateForm = () => {
		this.setState({ isNewTourFormOpen: false });
	};

	assignOrderToJourney = (
		journeyID: string,
		journeyTitle: string,
		tabIndex: number
	) => {
		const { orderData, orderItemId } = this.state;
		this.setState({ isOverlayModalOpen: true }, () => {
			const reqData = {
				journeyId: journeyID,
				orderId: orderData._id,
				orderItemId: orderItemId,
			};

			TourBookService.orderToTour(reqData)
				.then((response: any) => {
					this.setState(
						{ isOverlayModalOpen: false, isTourListOpen: false },
						() => {
							setTimeout(() => {
								this.props.navigation.navigate("JourneyDetails", {
									journeyID,
									journeyTitle,
									tabIndex,
								});
							}, 300);
						}
					);
				})
				.catch((error) => {
					this.setState({ isOverlayModalOpen: false });
				});
		});
	};

	keyExtractor = (item: any) => item._id;

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				style={styles.card}
				underlayColor={Colors.lightGrey}
				onPress={() => this.assignOrderToJourney(item._id, item.name, 1)}
			>
				<>
					<View style={{ width: "20%" }}>
						<ListAvatar>
							<Text
								style={[styles.boldText, { fontSize: 16, color: Colors.white }]}
							>
								{item.name.charAt(0)}
							</Text>
						</ListAvatar>
					</View>
					<View style={{ width: "80%" }}>
						<Text style={[styles.boldText, { textAlign: "left" }]}>
							{item.name}
						</Text>
						<Text style={[styles.lightText, { textAlign: "left" }]}>
							{moment(item.createdOn).format("D MMMM, YYYY")}
						</Text>
					</View>
				</>
			</TouchableHighlight>
		);
	};

	getListHeaderComponent = () => {
		return this.state.tours.length > 0 ? (
			<TouchableOpacity
				activeOpacity={1}
				style={styles.addBtn}
				onPress={this.onOpenTourCreateForm}
			>
				<FontAwesomeIcon size={18} icon={faPlus} color={Colors.primaryBtn} />
				<Text style={styles.addBtnText}>{LocalizedText.NEW_TOUR_BOOK}</Text>
			</TouchableOpacity>
		) : null;
	};

	getListEmptyComponent = () => (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<TouchableOpacity
				activeOpacity={0.7}
				style={styles.addBtn}
				onPress={this.onOpenTourCreateForm}
			>
				<FontAwesomeIcon size={18} icon={faPlus} color={Colors.primaryBtn} />
				<Text style={styles.addBtnText}>{LocalizedText.NEW_TOUR_BOOK}</Text>
			</TouchableOpacity>
		</View>
	);

	gotoEsimDetails = (productId: string, productName: string, esimData: any) => {
		this.props.navigation.navigate("JourneyEsimDetails", {
			productId: productId,
			productName: productName,
			esimId: esimData.esim.id,
		});
	};

	gotoTopUpEsimDetails = (
		productId: string,
		productName: string,
		topupData: any
	) => {
		this.props.navigation.navigate("JourneyEsimDetails", {
			productId: productId,
			productName: productName,
			esimId: topupData.esimId,
		});
	};

	onSubmitNewTour = (values: any) => {
		Keyboard.dismiss();
		this.setState({ isOverlayModalOpen: true }, () => {
			const { userData } = this.context;
			const reqData = { name: values.journeyName, customer_id: userData?._id };

			TourBookService.create(reqData)
				.then((response: any) => {
					const resData: any = response.data;
					const itemsArr = [...this.state.tours];
					itemsArr.unshift(response.data);
					this.setState({ tours: itemsArr, isNewTourFormOpen: false });
					this.assignOrderToJourney(resData._id, values.journeyName, 1);
				})
				.catch((error) => {
					this.setState({ isOverlayModalOpen: false });
				});
		});
	};

	goToTourBook = (
		journeyID: string,
		journeyTitle: string,
		tabIndex: number
	) => {
		this.props.navigation.navigate("JourneyDetails", {
			journeyID,
			journeyTitle,
			tabIndex,
		});
	};

	isRescheduleAllowed = (item: any) => {
		const {
			bookingDateTime,
			startTime,
			product: { minRescheduleHour, timeZone },
		} = item;

		let itemBookingDateTime: string = "";

		if (
			[
				ProductCategory.LOUNGE,
				ProductCategory.MEET_AND_GREET,
				ProductCategory.MOBILITY_ASSIST,
				ProductCategory.PORTER,
			].includes(item.product.category)
		) {
			itemBookingDateTime = moment
				.utc(
					`${moment.utc(bookingDateTime).format("YYYY-MM-DD")} ${startTime}`,
					"YYYY-MM-DD HH:mm"
				)
				.format("YYYY-MM-DD HH:mm:ss");
		} else {
			itemBookingDateTime = moment
				.utc(bookingDateTime)
				.format("YYYY-MM-DD HH:mm:ss");
		}

		const minRescheduleTime: any = moment(itemBookingDateTime)
			.subtract(minRescheduleHour, "hours")
			.format("YYYY-MM-DD HH:mm:ss");

		const currentDateTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

		return moment(currentDateTime, "YYYY-MM-DD HH:mm:ss").isSameOrBefore(
			moment(minRescheduleTime, "YYYY-MM-DD HH:mm:ss")
		);
	};

	isCancelAllowed = (item: any) => {
		const {
			bookingDateTime,
			startTime,
			product: { timeZone },
		} = item;

		let itemBookingDateTime: string = "";

		if (
			[
				ProductCategory.LOUNGE,
				ProductCategory.MEET_AND_GREET,
				ProductCategory.MOBILITY_ASSIST,
				ProductCategory.PORTER,
			].includes(item.product.category)
		) {
			itemBookingDateTime = moment
				.utc(
					`${moment.utc(bookingDateTime).format("YYYY-MM-DD")} ${startTime}`,
					"YYYY-MM-DD HH:mm"
				)
				.format("YYYY-MM-DD HH:mm:ss");
		} else {
			itemBookingDateTime = moment
				.utc(bookingDateTime)
				.format("YYYY-MM-DD HH:mm:ss");
		}

		const currentDateTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

		return moment(currentDateTime, "YYYY-MM-DD HH:mm:ss").isBefore(
			moment(itemBookingDateTime, "YYYY-MM-DD HH:mm:ss")
		);
	};

	onOpenCancelModal = (item: any) => {
		this.setState(
			{
				isLoadingReasons: true,
				isCancelModalOpen: true,
				cancelReasons: [],
			},
			() => {
				OrderService.getCancelReasons(item.product.category)
					.then((response) => {
						this.setState({
							cancelReasons: response.data,
							cancelProductData: item,
							isLoadingReasons: false,
						});
					})
					.catch((error) => {
						this.setState({
							cancelReasons: [],
							isLoadingReasons: false,
						});
					});
			}
		);
	};

	onCloseCancelModal = () => {
		this.setState({ isCancelModalOpen: false });
	};

	onSelectCancelReason = (id: any) => {
		this.formikRef2 &&
			this.formikRef2.current?.setFieldValue("cancelReasonId", id);
	};

	onCancelOrder = (values: CancelFormModel) => {
		const { cancelProductData, orderId } = this.state;

		const localDate: string = moment()
			.tz(cancelProductData.product.timeZone)
			.format("YYYY-MM-DD");
		const localTime: string = moment()
			.tz(cancelProductData.product.timeZone)
			.format("HH:mm:ss");

		const currentDateTime = moment(`${localDate} ${localTime}`).format(
			"YYYY-MM-DD HH:mm:ss"
		);

		let itemBookingDateTime: string = "";

		if (
			[
				ProductCategory.LOUNGE,
				ProductCategory.MEET_AND_GREET,
				ProductCategory.MOBILITY_ASSIST,
				ProductCategory.PORTER,
			].includes(cancelProductData.product.category)
		) {
			itemBookingDateTime = moment
				.utc(
					`${moment
						.utc(cancelProductData.bookingDateTime)
						.format("YYYY-MM-DD")} ${cancelProductData.startTime}`,
					"YYYY-MM-DD HH:mm"
				)
				.format("YYYY-MM-DD HH:mm:ss");
		} else {
			itemBookingDateTime = moment
				.utc(cancelProductData.bookingDateTime)
				.format("YYYY-MM-DD HH:mm:ss");
		}

		let duration: number = moment(itemBookingDateTime).diff(
			moment(currentDateTime),
			"hours"
		);

		const reqData = {
			orderId: orderId,
			orderItemId: cancelProductData._id,
			reasonId: values.cancelReasonId,
			productId: cancelProductData.product._id,
			timeZone: cancelProductData.product.timeZone,
		};

		if (duration <= 2) {
			Alert.alert(
				"Warning",
				"No refunds for cancellations within 2 hours of booking. Do you still want to proceed?",
				[
					{
						text: LocalizedText.NO,
						style: "cancel",
					},
					{
						text: LocalizedText.YES,
						onPress: () => {
							this.setState(
								{
									isCancelModalOpen: false,
									isOverlayModalOpen: true,
								},
								() => {
									OrderService.cancelOrder(reqData)
										.then((response) => {
											this.setState({ isOverlayModalOpen: false }, () => {
												Alert.alert(LocalizedText.CANCELED, response.message);
												this.loadOrderDetails();
											});
										})
										.catch((error) => {
											this.setState({ isOverlayModalOpen: false });
										});
								}
							);
						},
					},
				]
			);
		} else {
			this.setState(
				{
					isCancelModalOpen: false,
					isOverlayModalOpen: true,
				},
				() => {
					OrderService.cancelOrder(reqData)
						.then((response) => {
							this.setState({ isOverlayModalOpen: false }, () => {
								Alert.alert(LocalizedText.CANCELED, response.message);
								this.loadOrderDetails();
							});
						})
						.catch((error) => {
							this.setState({ isOverlayModalOpen: false });
						});
				}
			);
		}
	};

	goToReschedule = (item: any) => {
		this.props.navigation.navigate("Reschedule", {
			orderId: this.state.orderId,
			orderNumber: this.state.orderData.orderNumber,
			category: item.product.category,
			timeZone: item.product.timeZone,
			minBookingHour: item.product.minBookingHour,
			orderItemId: item._id,
			bookingDateTime: item.bookingDateTime,
			startTime: item.startTime,
			productStartTime: item.product.startTime,
			productEndTime: item.product.endTime,
		});
	};

	onOpenPaymentInfoModal = () => {
		this.setState({ isPaymentInfoModalOpen: true });
	};

	onClosePaymentInfoModal = () => {
		this.setState({ isPaymentInfoModalOpen: false });
	};

	onOpenItemPriceModal = () => {
		this.setState({ isItemPriceModalOpen: true });
	};

	onCloseItemPriceModal = () => {
		this.setState({ isItemPriceModalOpen: false });
	};

	onOpenOrderPriceModal = () => {
		this.setState({ isOrderPriceModalOpen: true });
	};

	onCloseOrderPriceModal = () => {
		this.setState({ isOrderPriceModalOpen: false });
	};

	onDownloadInvoice = () => {
		requestStoragePermission(() => {
			const { orderId, orderNumber } = this.state;
			const reqData = { orderId: orderId };
			this.setState({ isOverlayModalOpen: true }, () => {
				OrderService.downloadInvoiceContent(reqData)
					.then((base64) => {
						this.setState({ isOverlayModalOpen: false }, async () => {
							try {
								const filepath: string = `${DownloadDirectoryPath}/${orderNumber}.pdf`;
								await mkdir(DownloadDirectoryPath);
								await writeFile(filepath, base64, "base64");
								Snackbar.show({
									text: "Invoice downloaded successfully",
									duration: Snackbar.LENGTH_LONG,
								});
							} catch (error) {
								Alert.alert("Error", "Failed to save the invoice");
							}
						});
					})
					.catch((error) => {
						this.setState({ isOverlayModalOpen: false });
					});
			});
		});
	};

	getStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case OrderStatus.PENDING:
				icon = faExclamation;
				break;
			case OrderStatus.COMPLETED:
			case OrderStatus.PLACED:
				icon = faCheck;
				break;
			case OrderStatus.RESCHEDULED:
				icon = faArrowRotateRight;
				break;
			case OrderStatus.CANCELLED:
				icon = faXmark;
				break;
			default:
				break;
		}
		return icon;
	};

	onChangeTab = (index: number) => {
		this.setState({ selectedTabIndex: index });
	};

	renderTabContent = () => {
		const { selectedTabIndex, orderItemData } = this.state;
		const orderHistory: Array<any> = orderItemData.history;

		switch (selectedTabIndex) {
			case 0:
				return <ItemStatus orderHistory={orderHistory} />;
			case 1:
				return <CustomerReview />;
			default:
				return null;
		}
	};

	gotoBack = () => {
		this.props.navigation.pop(1);
		// this.props.navigation.navigate("MyOrders");
		return true;
	};

	render = () => {
		const { orderData, orderItemData } = this.state;
		let itemPriceAfterDiscount: number = 0;
		let totalDiscount: number = 0;
		if (
			(orderItemData && orderItemData.coupon !== null) ||
			(orderData && orderData.coupon !== null)
		) {
			const baseDiscount: number =
				orderItemData?.coupon !== null ? orderItemData?.coupon?.discount : 0;
			const additionalDiscount: number =
				orderData?.coupon !== null
					? Number(orderData?.coupon?.discount / orderData.totalItem)
					: 0;
			totalDiscount += baseDiscount + additionalDiscount;
		}
		itemPriceAfterDiscount += Number(
			orderItemData?.targetedPrice?.value - totalDiscount
		);

		return (
			<Container>
				<Header
					title={`#${this.state.orderNumber}`}
					onBackAction={this.gotoBack}
				/>
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
					) : (
						<ScrollView
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{ width: "100%" }}
						>
							<View style={[styles.orderItemDetails]}>
								{orderItemData.product.thumbnail !== null && (
									<Image
										style={[styles.productImage, { resizeMode: "contain" }]}
										source={{ uri: orderItemData.product.thumbnail }}
									/>
								)}

								{orderItemData.product.thumbnail === null &&
									orderItemData.product.category ===
										ProductCategory.CAR_RENTAL && (
										<View
											style={{
												width: 80,
												height: 80,
												padding: 10,
												backgroundColor: Colors.secondaryAlpha1,
												borderRadius: 40,
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<FontAwesomeIcon
												icon={faCar}
												size={40}
												color={Colors.secondary}
											/>
										</View>
									)}

								<View style={styles.eSimTitleView}>
									<View style={{ width: "70%" }}>
										<Text
											style={[styles.eSimTitleText, { textAlign: "center" }]}
										>
											{orderItemData.product.name}
										</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											marginTop: 4,
										}}
									>
										<Text style={[styles.eSimSubTitleText, { marginTop: 0 }]}>
											{toUpperCaseWord(
												orderItemData.product.category
													.toLowerCase()
													.replace(/_/g, " ")
											)}
										</Text>
										{orderItemData.product.subCategory !== null ? (
											<Text style={[styles.eSimSubTitleText, { marginTop: 0 }]}>
												{", " +
													toUpperCaseWord(
														orderItemData.product.subCategory
															.toLowerCase()
															.replace("_", " ")
													)}
											</Text>
										) : null}
									</View>
								</View>
								<>
									<View
										style={{
											width: "100%",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Text style={[styles.lightText, { fontSize: 14 }]}>
											{LocalizedText.ORDER_NUMBER}
										</Text>
										<Text style={styles.boldText}>{orderData.orderNumber}</Text>

										<Text
											style={[
												styles.lightText,
												{ fontSize: 14, marginTop: 10 },
											]}
										>
											{"Ordered On"}
										</Text>
										{/* {orderItemData.product.category ===
										ProductCategory.CAR_RENTAL ? (
											<Text style={styles.boldText}>
												{moment
													.utc(orderItemData.bookingDateTime)
													.format("D MMMM, YYYY HH:mm")}
											</Text>
										) : (
											<Text style={styles.boldText}>
												{moment
													.utc(orderItemData.bookingDateTime)
													.format("D MMMM, YYYY") +
													" " +
													moment
														.utc(orderItemData.startTime, "HH:mm:ss")
														.format("HH:mm")}
											</Text>
										)} */}
										<Text style={styles.boldText}>
											{moment
												.utc(orderItemData.updatedOn)
												.format("D MMMM, YYYY HH:mm")}
										</Text>
									</View>
								</>
							</View>
							<View
								style={{
									backgroundColor: Colors.greyBtnBg,
								}}
							>
								<View style={styles.rechargeAndBills}>
									<View style={styles.orderDetailView}>
										<View
											style={[
												styles.orderDetail,
												{
													borderBottomWidth: 1,
													borderStyle: "dotted",
													borderColor: Colors.lightBorder,
													paddingBottom: 6,
													paddingHorizontal: 15,
												},
											]}
										>
											<View>
												<Text style={styles.orderDetailHeading}>
													{"Order Item Details"}
												</Text>
											</View>
											{orderItemData.status === OrderStatus.PLACED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																OrderStatusBackgroundColor.PLACED,
															borderColor: OrderStatusBorderColor.PLACED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	OrderStatusIconBackgroundColor.PLACED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getStatusIcon(orderItemData.status)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{toUpperCaseWord(
															orderItemData.status.toLowerCase()
														)}
													</Text>
												</View>
											) : orderItemData.status === OrderStatus.COMPLETED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																OrderStatusBackgroundColor.COMPLETED,
															borderColor: OrderStatusBorderColor.COMPLETED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	OrderStatusIconBackgroundColor.COMPLETED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getStatusIcon(orderItemData.status)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{toUpperCaseWord(
															orderItemData.status.toLowerCase()
														)}
													</Text>
												</View>
											) : orderItemData.status === OrderStatus.CANCELLED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																OrderStatusBackgroundColor.CANCELLED,
															borderColor: OrderStatusBorderColor.CANCELLED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	OrderStatusIconBackgroundColor.CANCELLED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getStatusIcon(orderItemData.status)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{toUpperCaseWord(
															orderItemData.status.toLowerCase()
														)}
													</Text>
												</View>
											) : orderItemData.status === OrderStatus.PENDING ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																OrderStatusBackgroundColor.PENDING,
															borderColor: OrderStatusBorderColor.PENDING,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	OrderStatusIconBackgroundColor.PENDING,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getStatusIcon(orderItemData.status)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{toUpperCaseWord(
															orderItemData.status.toLowerCase()
														)}
													</Text>
												</View>
											) : orderItemData.status === OrderStatus.RESCHEDULED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																OrderStatusBackgroundColor.RESCHEDULED,
															borderColor: OrderStatusBorderColor.RESCHEDULED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	OrderStatusIconBackgroundColor.RESCHEDULED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getStatusIcon(orderItemData.status)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{toUpperCaseWord(
															orderItemData.status.toLowerCase()
														)}
													</Text>
												</View>
											) : null}
										</View>
										<View
											style={{
												width: "100%",
												paddingVertical: 8,
												paddingHorizontal: 15,
											}}
										>
											{orderItemData.product.category ===
												ProductCategory.E_SIM && (
												<>
													{orderItemData.esimData !== null ? (
														<View
															style={{
																flexDirection: "row",
																width: "100%",
																alignItems: "flex-start",
																justifyContent: "space-between",
																gap: 10,
															}}
														>
															<Image
																source={{
																	uri: getEsimQrImageUrl(
																		orderItemData.esimData.esim.qr
																	),
																}}
																style={styles.barCodeImage}
															/>

															<View>
																<Text style={styles.lightTextItemDetails}>
																	{"Consumer Name"}
																</Text>
																<Text style={styles.boldTextItemDetails}>
																	{orderItemData.esimData.consumerName}
																</Text>

																<Text style={styles.lightTextItemDetails}>
																	{"Esim Id"}
																</Text>
																<Text style={styles.boldTextItemDetails}>
																	{orderItemData.esimData.esim.id}
																</Text>

																<Text style={styles.lightTextItemDetails}>
																	{"ICCID"}
																</Text>
																<Text style={styles.boldTextItemDetails}>
																	{orderItemData.esimData.esim.iccid}
																</Text>
															</View>
															<View style={{ flexDirection: "row" }}>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "500",
																		fontSize: 16,
																		color: Colors.primaryFont,
																	}}
																>
																	{`${orderItemData.esimData.dataOrder.destinations[0].quotaGB}`}
																</Text>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "500",
																		fontSize: 12,
																		color: Colors.primaryFont,
																		alignSelf: "flex-end",
																		marginBottom: 1,
																	}}
																>
																	{" GB"}
																</Text>
															</View>
														</View>
													) : (
														<>
															<Text style={styles.lightTextItemDetails}>
																{"Consumer Name"}
															</Text>
															<Text style={styles.boldTextItemDetails}>
																{orderData.customer.name}
															</Text>

															<Text style={styles.lightTextItemDetails}>
																{"Esim Id"}
															</Text>
															<Text style={styles.boldTextItemDetails}>
																{orderItemData.topupData.esimId}
															</Text>
															<Text style={styles.lightTextItemDetails}>
																{"Type"}
															</Text>
															<Text style={styles.boldTextItemDetails}>
																{orderData.orderType}
															</Text>
														</>
													)}
												</>
											)}
											{orderItemData.product.category ===
											ProductCategory.CAR_RENTAL ? (
												<>
													<Text style={styles.lightTextItemDetails}>
														{"Source"}
													</Text>
													<Text style={styles.boldTextItemDetails}>
														{orderItemData.source}
													</Text>
													<Text style={styles.lightTextItemDetails}>
														{"Destination"}
													</Text>
													<Text style={styles.boldTextItemDetails}>
														{orderItemData.destination}
													</Text>
													<Text style={styles.lightTextItemDetails}>
														{"Booking Ref. Number"}
													</Text>
													<Text style={styles.boldTextItemDetails}>
														{orderItemData.bookingNumber}
													</Text>
												</>
											) : null}

											{[
												ProductCategory.CAR_RENTAL,
												ProductCategory.LOUNGE,
												ProductCategory.MEET_AND_GREET,
												ProductCategory.MOBILITY_ASSIST,
												ProductCategory.PORTER,
											].includes(orderItemData.product.category) ? (
												<>
													<Text style={styles.lightTextItemDetails}>
														{"Seller"}
													</Text>
													<Text style={styles.boldTextItemDetails}>
														{orderItemData.seller.name}
													</Text>
													<Text style={styles.lightTextItemDetails}>
														{"Booking Date & Time"}
													</Text>
													{orderItemData.product.category ===
													ProductCategory.CAR_RENTAL ? (
														<Text style={styles.boldTextItemDetails}>
															{moment
																.utc(orderItemData.bookingDateTime)
																.format("D MMMM, YYYY HH:mm")}
														</Text>
													) : (
														<Text style={styles.boldTextItemDetails}>
															{moment
																.utc(orderItemData.bookingDateTime)
																.format("D MMMM, YYYY") +
																" " +
																moment
																	.utc(orderItemData.startTime, "HH:mm:ss")
																	.format("HH:mm")}
														</Text>
													)}
													<Text style={styles.lightTextItemDetails}>
														{"Quantity"}
													</Text>
													<Text style={styles.boldTextItemDetails}>
														{`${orderItemData.quantity}`}
													</Text>
													<Text style={styles.lightTextItemDetails}>
														{"Delivery Code"}
													</Text>
													<View
														style={{
															marginVertical: 5,
															flexDirection: "row",
															alignItems: "center",
														}}
													>
														{orderItemData.deliveryCode
															.toString()
															.split("")
															.map((item: any, index: any) => (
																<View
																	key={`code-${index}`}
																	style={{
																		width: 30,
																		height: 30,
																		marginRight: 4,
																		borderRadius: 50,
																		backgroundColor: "rgba(21, 189, 216, 0.2)",
																		justifyContent: "center",
																		alignItems: "center",
																	}}
																>
																	<Text
																		style={{
																			fontFamily: "Roboto-Medium",
																			fontWeight: "500",
																			fontSize: 18,
																			color: Colors.primaryFont,
																		}}
																	>
																		{item}
																	</Text>
																</View>
															))}
													</View>
													{/* <Text style={styles.boldTextItemDetails}>
														{`${orderItemData.deliveryCode}`}
													</Text> */}
													{typeof orderItemData.reason !== "undefined" && (
														<>
															<Text style={styles.lightTextItemDetails}>
																{"Reason"}
															</Text>
															<Text style={styles.boldTextItemDetails}>
																{orderItemData.reason}
															</Text>
														</>
													)}
													{/* {typeof orderItemData.refundAmount !==
														"undefined" && (
														<>
															<Text style={styles.lightTextItemDetails}>
																{"Refund Amount"}
															</Text>
															<Text style={styles.boldTextItemDetails}>
																{`${orderItemData.refundAmount}`}
															</Text>
														</>
													)} */}
												</>
											) : null}
										</View>
									</View>
									{orderItemData.status !== OrderStatus.CANCELLED && (
										<View style={styles.buttonView}>
											{orderData.orderType === null && (
												<>
													{typeof orderItemData.journeyId !== "undefined" &&
													typeof orderItemData.journeyName !== "undefined" ? (
														<TouchableOpacity
															style={{ flex: 1, paddingVertical: 14 }}
															onPress={() =>
																orderItemData.product.category ===
																ProductCategory.E_SIM
																	? this.goToTourBook(
																			orderItemData.journeyId,
																			orderItemData.journeyName,
																			3
																	  )
																	: this.goToTourBook(
																			orderItemData.journeyId,
																			orderItemData.journeyName,
																			1
																	  )
															}
														>
															<Text
																style={{
																	fontFamily: "Roboto-Medium",
																	fontWeight: "500",
																	fontSize: 14,
																	color: Colors.primaryBtn,
																	textAlign: "center",
																}}
															>
																{"View in Tour Book"}
															</Text>
														</TouchableOpacity>
													) : (
														<TouchableOpacity
															style={{ flex: 1, paddingVertical: 14 }}
															onPress={() => {
																this.onOpenTourList();
																this.setState({
																	orderItemId: orderItemData._id,
																});
															}}
														>
															<Text
																style={{
																	fontFamily: "Roboto-Medium",
																	fontWeight: "500",
																	fontSize: 14,
																	color: Colors.primaryBtn,
																	textAlign: "center",
																}}
															>
																{"Add to Tour Book"}
															</Text>
														</TouchableOpacity>
													)}
												</>
											)}

											{orderItemData.product.category ===
											ProductCategory.E_SIM ? (
												<>
													{orderData.orderType !== null ? (
														<>
															<View style={styles.verticalLine} />
															<TouchableOpacity
																style={{ flex: 1, paddingVertical: 14 }}
																onPress={() =>
																	this.gotoTopUpEsimDetails(
																		orderItemData.product._id,
																		orderItemData.product.name,
																		orderItemData.topupData
																	)
																}
															>
																<Text
																	style={{
																		fontFamily: "Roboto-Regular",
																		fontWeight: "500",
																		fontSize: 14,
																		color: Colors.primaryBtn,
																		textAlign: "center",
																	}}
																>
																	{"Check Usage"}
																</Text>
															</TouchableOpacity>
														</>
													) : (
														<>
															<View style={styles.verticalLine} />
															<TouchableOpacity
																style={{ flex: 1, paddingVertical: 14 }}
																onPress={() =>
																	this.gotoEsimDetails(
																		orderItemData.product._id,
																		orderItemData.product.name,
																		orderItemData.esimData
																	)
																}
															>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "500",
																		fontSize: 14,
																		color: Colors.primaryBtn,
																		textAlign: "center",
																	}}
																>
																	{"Check Usage"}
																</Text>
															</TouchableOpacity>
														</>
													)}
												</>
											) : null}

											{orderItemData.status !== OrderStatus.COMPLETED && (
												<>
													{[
														ProductCategory.CAR_RENTAL,
														ProductCategory.LOUNGE,
														ProductCategory.MEET_AND_GREET,
														ProductCategory.MOBILITY_ASSIST,
														ProductCategory.PORTER,
													].includes(orderItemData.product.category) &&
													this.isCancelAllowed(orderItemData) ? (
														<>
															<View style={styles.verticalLine} />
															<TouchableOpacity
																style={{ flex: 1, paddingVertical: 14 }}
																onPress={() =>
																	this.onOpenCancelModal(orderItemData)
																}
															>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "500",
																		fontSize: 14,
																		color: Colors.primaryBtn,
																		textAlign: "center",
																	}}
																>
																	{"Cancel"}
																</Text>
															</TouchableOpacity>
														</>
													) : null}
													{[ProductCategory.CAR_RENTAL].includes(
														orderItemData.product.category
													) &&
													orderItemData.product.isRescheduleable &&
													this.isRescheduleAllowed(orderItemData) &&
													orderItemData.rescheduleableCount > 0 ? (
														<>
															<View style={styles.verticalLine} />
															<TouchableOpacity
																style={{ flex: 1, paddingVertical: 14 }}
																onPress={() => {
																	// this.onOpenRescheduleModal(item);
																	this.goToReschedule(orderItemData);
																}}
															>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "400",
																		fontSize: 14,
																		color: Colors.primaryBtn,
																		textAlign: "center",
																	}}
																>
																	{"Reschedule"}
																</Text>
															</TouchableOpacity>
														</>
													) : null}
												</>
											)}

											{/* <View style={styles.verticalLine} />
									<TouchableOpacity style={{ flex: 1, paddingVertical: 14 }}>
										<Text
											style={{
												fontFamily: "Roboto-Regular",
												fontWeight: "400",
												fontSize: 14,
												color: Colors.primaryBtn,
												textAlign: "center",
											}}
										>
											{"Check Usage"}
										</Text>
									</TouchableOpacity> */}
										</View>
									)}
								</View>
								<View
									// style={{
									// 	width: "100%",
									// 	flexDirection: "row",
									// 	alignItems: "center",
									// 	justifyContent: "space-between",
									// 	paddingHorizontal: 15,
									// 	borderColor: Colors.greyBtnBg,
									// 	borderTopWidth: 1,
									// 	backgroundColor: Colors.white,
									// 	paddingVertical: 10,
									// }}
									style={styles.rechargeAndBills}
								>
									<View
										style={{
											width: "100%",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-between",
											paddingHorizontal: 15,
											borderColor: Colors.greyBtnBg,
											borderTopWidth: 1,
											backgroundColor: Colors.white,
											paddingVertical: 10,
										}}
									>
										<View>
											<Text style={styles.orderDetailHeading}>
												{"Total Item Price"}
											</Text>
											{orderData.coupon !== null ||
											orderItemData.coupon !== null ? (
												<View
													style={{
														flexDirection: "row",
														alignItems: "center",
													}}
												>
													<Text style={styles.lightTextItemDetails}>
														{"You saved "}
													</Text>
													<Text
														style={{
															fontSize: 12,
															fontFamily: "Roboto-Regular",
															fontWeight: "400",
															color: Colors.success,
															opacity: 0.8,
															lineHeight: 18,
														}}
													>
														{`${
															orderItemData.targetedPrice.code
														} ${totalDiscount.toFixed(2)}`}
													</Text>
													<Text style={styles.lightTextItemDetails}>
														{" on this item."}
													</Text>
												</View>
											) : null}
										</View>
										<View>
											<Text style={styles.orderDetailHeading}>
												{`${
													orderItemData.targetedPrice.code
												} ${itemPriceAfterDiscount.toFixed(2)}`}
											</Text>
											<TouchableOpacity onPress={this.onOpenItemPriceModal}>
												<Text
													style={{
														fontFamily: "Roboto-Medium",
														fontWeight: "500",
														fontSize: 12,
														color: Colors.primaryBtn,
														textAlign: "right",
													}}
												>
													{"View Breakup"}
												</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
								{typeof orderItemData.refundStatus !== "undefined" &&
								orderItemData.refundStatus === "succeeded" ? (
									<View
										style={[
											{
												backgroundColor: Colors.white,
												width: "100%",
												marginTop: 15,
											},
										]}
									>
										<View
											style={{
												width: "100%",
												borderBottomColor: Colors.lightBorder,
												borderBottomWidth: 1,
												paddingHorizontal: 15,
												paddingVertical: 10,
											}}
										>
											<Text style={styles.orderDetailHeading}>
												{"Refund Details"}
											</Text>
										</View>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
												alignItems: "center",
												paddingHorizontal: 15,
												paddingVertical: 10,
											}}
										>
											<Text
												style={[
													{
														fontFamily: "Roboto-Medium",
														fontWeight: "500",
														fontSize: 14,
														lineHeight: 21,
														color: Colors.lightFont,
													},
												]}
											>
												{"Total Refund Amount"}
											</Text>
											<Text
												style={[
													{
														fontFamily: "Roboto-Medium",
														fontWeight: "500",
														fontSize: 14,
														lineHeight: 21,
														color: Colors.primaryFont,
													},
												]}
											>
												{orderItemData.refundAmount}
											</Text>
										</View>
									</View>
								) : null}
								<View
									style={{
										flex: 1,
										width: "100%",
										marginTop: 15,
										backgroundColor: Colors.white,
									}}
								>
									<View
										style={{
											borderBottomColor: Colors.lightBorder,
											borderBottomWidth: 1,
										}}
									>
										<MaterialTabs
											items={this.state.tabItems}
											selectedIndex={this.state.selectedTabIndex}
											onChange={this.onChangeTab}
											barColor={Colors.white}
											indicatorColor={Colors.primaryBg}
											activeTextColor={Colors.primaryBg}
											inactiveTextColor={Colors.lightFont}
											scrollable={false}
											allowFontScaling={true}
											uppercase={false}
										/>
									</View>
									{this.renderTabContent()}
								</View>

								{this.state.orderItems.length > 1 ? (
									<View
										style={[
											{
												backgroundColor: Colors.white,
												width: "100%",
												marginTop: 15,
											},
										]}
									>
										<View
											style={{
												width: "100%",
												borderBottomColor: Colors.lightBorder,
												borderBottomWidth: 1,
												paddingHorizontal: 15,
												paddingVertical: 10,
											}}
										>
											<Text style={styles.orderDetailHeading}>
												{"Other Items in this order"}
											</Text>
										</View>
										{this.state.otherItems.map((item: any, index: number) => {
											let isLastElement =
												index + 1 === this.state.otherItems.length;
											return (
												<TouchableOpacity
													style={{
														marginTop: 5,
														paddingHorizontal: 15,
														width: "100%",
														backgroundColor: Colors.white,
													}}
													key={`${index}`}
													onPress={() =>
														this.orderData(
															this.state.orderId,
															item._id,
															this.state.orderNumber
														)
													}
												>
													<View style={styles.item}>
														{item.product.thumbnail !== null && (
															<Image
																style={{ height: 50, width: 50 }}
																source={{ uri: item.product.thumbnail }}
															/>
														)}
														{item.product.thumbnail === null &&
															item.product.category ===
																ProductCategory.E_SIM && (
																<FontAwesomeIcon
																	icon={faSimCard}
																	size={45}
																	color={Colors.primary}
																	// style={{ alignSelf: "flex-end" }}
																/>
															)}
														<View
															style={{
																width: 250,
															}}
														>
															<Text
																ellipsizeMode="tail"
																numberOfLines={1}
																style={styles.title}
															>
																{item.product.name}
															</Text>
															{/* <Text style={styles.subTitle}>{}</Text> */}
															<View
																style={{
																	flexDirection: "row",
																	alignItems: "center",
																}}
															>
																<Text
																	style={[styles.subTitle, { marginTop: 0 }]}
																>
																	{toUpperCaseWord(
																		item.product.category
																			.toLowerCase()
																			.replace(/_/g, " ")
																	)}
																</Text>
																{item.product.subCategory !== null ? (
																	<Text
																		style={[styles.subTitle, { marginTop: 0 }]}
																	>
																		{", " +
																			toUpperCaseWord(
																				item.product.subCategory
																					.toLowerCase()
																					.replace("_", " ")
																			)}
																	</Text>
																) : null}
															</View>
															<Text
																style={styles.subTitleText}
															>{`Qty: ${item.quantity}`}</Text>
															{[
																ProductCategory.LOUNGE,
																ProductCategory.MEET_AND_GREET,
																ProductCategory.MOBILITY_ASSIST,
																ProductCategory.PORTER,
															].includes(item.product.category) ? (
																<Text style={styles.subTitleText}>
																	{moment
																		.utc(item.bookingDateTime)
																		.format("D MMMM, YYYY") +
																		" " +
																		moment
																			.utc(item.startTime, "HH:mm:ss")
																			.format("HH:mm")}
																</Text>
															) : item.product.category ===
															  ProductCategory.CAR_RENTAL ? (
																<Text style={styles.subTitleText}>
																	{moment
																		.utc(item.bookingDateTime)
																		.format("D MMMM, YYYY HH:mm")}
																</Text>
															) : null}
														</View>
														<View
														// style={{
														// 	flexDirection: "row",
														// 	justifyContent: "flex-start",
														// }}
														>
															{/* <Text
																style={{
																	fontFamily: "Roboto-Medium",
																	fontWeight: "500",
																	fontSize: 14,
																	lineHeight: 30,
																	color: Colors.secondaryFont,
																}}
															>{`${item.targetedPrice.code} ${item.targetedPrice.value}`}</Text> */}
															<FontAwesomeIcon
																size={18}
																icon={faChevronRight}
																color={Colors.secondary}
																style={{ marginLeft: 10 }}
															/>
														</View>
													</View>
													{!isLastElement && (
														<View
															style={{
																width: "100%",
																borderBottomColor: Colors.lightBorder,
																borderBottomWidth: 1,
																borderStyle: "dashed",
															}}
														/>
													)}
												</TouchableOpacity>
											);
										})}
									</View>
								) : null}
								<View style={styles.totalPrice}>
									<View>
										<Text style={styles.orderDetailHeading}>
											{"Total Order Price"}
										</Text>
										{orderData.coupon !== null ||
										orderItemData.coupon !== null ? (
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
												}}
											>
												<Text style={styles.lightTextItemDetails}>
													{"You saved "}
												</Text>
												<Text
													style={{
														fontSize: 12,
														fontFamily: "Roboto-Regular",
														fontWeight: "400",
														color: Colors.success,
														opacity: 0.8,
														lineHeight: 18,
													}}
												>
													{`${orderData.orderCurrency} ${Number(
														this.state.overallDiscount
													).toFixed(2)}`}
												</Text>
												<Text style={styles.lightTextItemDetails}>
													{" on this order."}
												</Text>
											</View>
										) : null}
									</View>
									<View>
										<Text style={styles.orderDetailHeading}>
											{`${orderData.orderCurrency} ${Number(
												orderData.orderAmount
											).toFixed(2)}`}
										</Text>
										<TouchableOpacity onPress={this.onOpenOrderPriceModal}>
											<Text style={styles.viewBreakupText}>
												{"View Breakup"}
											</Text>
										</TouchableOpacity>
									</View>
								</View>

								<View style={[styles.rechargeAndBills, { marginVertical: 15 }]}>
									{this.state.qrCodeValue !== null ? (
										<View
											style={{
												marginVertical: 10,
												width: "100%",
												alignSelf: "flex-start",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<QRCode value={this.state.qrCodeValue} />
										</View>
									) : null}

									<View
										style={{
											width: "100%",
											height: 50,
											flexDirection: "row",
											alignItems: "center",
											borderColor: Colors.lightGrey,
											borderTopWidth: 1,
											backgroundColor: "white",
										}}
									>
										<TouchableOpacity
											style={{ flex: 1 }}
											onPress={this.onOpenPaymentInfoModal}
										>
											<Text
												style={{
													fontFamily: "Roboto-Medium",
													fontWeight: "500",
													fontSize: 14,
													color: Colors.primaryBtn,
													textAlign: "center",
												}}
											>
												{"Transaction Info"}
											</Text>
										</TouchableOpacity>
										{orderData.orderType === null && (
											<>
												<View style={styles.verticalLine} />
												<TouchableOpacity
													style={{ flex: 1 }}
													onPress={this.onDownloadInvoice}
												>
													<Text
														style={{
															fontFamily: "Roboto-Medium",
															fontWeight: "500",
															fontSize: 14,
															color: Colors.primaryBtn,
															textAlign: "center",
														}}
													>
														{"Get Invoice"}
													</Text>
												</TouchableOpacity>
											</>
										)}
									</View>
								</View>
							</View>
						</ScrollView>
					)}
				</WhiteContainer>
				<AbsoluteLoader isVisible={this.state.isOverlayModalOpen} />

				<BottomSheet
					isVisible={this.state.isTourListOpen}
					title={
						this.state.isNewTourFormOpen
							? LocalizedText.CREATE_NEW_TOUR_BOOK
							: LocalizedText.MY_TOUR_BOOKS
					}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.75) }}
					onClose={this.onCloseTourList}
				>
					{this.state.isLoadingTour ? (
						<Loader />
					) : this.state.isNewTourFormOpen ? (
						<Formik
							initialValues={{ journeyName: "" }}
							validationSchema={validationSchema}
							onSubmit={this.onSubmitNewTour}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								touched,
								errors,
								values,
							}) => (
								<View style={{ flex: 1, width: "100%", padding: 20 }}>
									<InputField
										value={values.journeyName}
										label={LocalizedText.TOUR_BOOK_TITLE}
										autoCapitalize="words"
										onChangeText={handleChange("journeyName")}
										onBlur={handleBlur("journeyName")}
										error={touched.journeyName ? errors.journeyName : null}
									/>
									<Button
										title={LocalizedText.SUBMIT}
										onPress={() => handleSubmit()}
										style={{ height: 35, width: 80 }}
									/>
								</View>
							)}
						</Formik>
					) : (
						<FlatList
							data={this.state.tours}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							initialNumToRender={Constant.DEFAULT_LIMIT}
							ListHeaderComponent={this.getListHeaderComponent}
							ListEmptyComponent={this.getListEmptyComponent}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps={"handled"}
						/>
					)}
				</BottomSheet>

				<BottomSheet
					isVisible={this.state.isCancelModalOpen}
					title={"Select a reason"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.onCloseCancelModal}
				>
					<>
						{this.state.isLoadingReasons ? (
							<Loader />
						) : (
							<>
								<Formik
									innerRef={this.formikRef2}
									initialValues={{
										cancelReasonId: "",
									}}
									validationSchema={cancelSchema}
									onSubmit={this.onCancelOrder}
								>
									{({ handleSubmit, touched, errors, values }) => (
										<View style={{ flex: 1, width: "100%", padding: 20 }}>
											<Text style={[styles.totalText, { marginBottom: 10 }]}>
												{"Please choose your reason for cancellation."}
											</Text>
											<View style={{ marginBottom: 15 }}>
												{this.state.cancelReasons.map(
													(item: any, index: any) => {
														return (
															<RadioButton
																key={index}
																label={item.reason}
																isChecked={values.cancelReasonId === item._id}
																onPress={this.onSelectCancelReason.bind(
																	this,
																	item._id
																)}
																style={{ paddingVertical: 5 }}
															/>
														);
													}
												)}
												{touched.cancelReasonId && errors.cancelReasonId ? (
													<Text style={styles.errorText}>
														{errors.cancelReasonId}
													</Text>
												) : null}
											</View>

											<View
												style={{
													width: "100%",
													flexDirection: "row",
													alignItems: "center",
													justifyContent: "space-evenly",
													marginTop: 20,
												}}
											>
												<Button
													title={"Proceed"}
													onPress={() => handleSubmit()}
													style={{ width: "100%", height: 45 }}
												/>
											</View>
										</View>
									)}
								</Formik>
							</>
						)}
					</>
				</BottomSheet>

				<BottomSheet
					isVisible={this.state.isPaymentInfoModalOpen}
					title={"Transactional Information"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.75) }}
					onClose={this.onClosePaymentInfoModal}
				>
					<>
						{this.state.isLoading ? (
							<Loader />
						) : (
							<>
								{orderData.paymentInfo !== null &&
								(orderData?.paymentInfo || []).length > 0 ? (
									<View style={[styles.tabComponent]}>
										<ScrollView
											showsVerticalScrollIndicator={false}
											keyboardShouldPersistTaps="handled"
											nestedScrollEnabled={true}
										>
											{(orderData.paymentInfo || []).map(
												(item: any, index: any) => {
													let isLastElement =
														index + 1 === (orderData.paymentInfo || []).length;
													return (
														<View
															key={index.toString()}
															style={[
																styles.paymentInfoWarpper,
																index === 0 ? { marginTop: 15 } : null,
															]}
														>
															<View
																style={[
																	styles.paymentInfoBox,
																	isLastElement ? { borderLeftWidth: 0 } : null,
																]}
															>
																<Text
																	style={{
																		fontFamily: "Roboto-Medium",
																		fontWeight: "500",
																		fontSize: 16,
																		color: Colors.primaryFont,
																		paddingLeft: 20,
																	}}
																>
																	{item.txnType}
																</Text>
																<View style={styles.payInfoDescBox}>
																	<Text style={styles.payInfoName}>
																		{`Txn. Id  ${item.transactionId.toUpperCase()}`}
																	</Text>

																	<View
																		style={{
																			flexDirection: "row",
																			alignItems: "center",
																		}}
																	>
																		<Text style={styles.payInfoDesc}>
																			{"Status"}
																		</Text>
																		<Text
																			style={[
																				styles.payInfoDesc,
																				item.txnStatus === "succeeded"
																					? { color: Colors.success }
																					: { color: Colors.danger },
																				{ marginLeft: 5 },
																			]}
																		>
																			{`${toUpperCaseWord(item.txnStatus)}`}
																		</Text>
																	</View>

																	<Text
																		style={styles.payInfoDesc}
																	>{`${item.currency} ${item.amount}`}</Text>
																	<Text style={styles.payInfoDesc}>
																		{moment(item.created * 1000).format(
																			"D MMMM YYYY, HH:mm"
																		)}
																	</Text>
																</View>
															</View>
															<View
																style={[
																	styles.paymentIndicator,
																	// item.txnType ===
																	// Constant.TRANSACTION_TYPE_PAYMENT
																	// 	? { backgroundColor: Colors.success }
																	// 	: { backgroundColor: Colors.danger },
																]}
															/>
														</View>
													);
												}
											)}
										</ScrollView>
									</View>
								) : null}
							</>
						)}
					</>
				</BottomSheet>

				<BottomSheet
					isVisible={this.state.isItemPriceModalOpen}
					title={"Payment Information"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.5) }}
					onClose={this.onCloseItemPriceModal}
				>
					<>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								marginBottom: 10,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.lightFont,
										marginRight: 5,
									},
								]}
							>
								{"Price"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${Number(orderItemData?.targetedPrice?.value).toFixed(2)}`}
								</Text>
							</View>
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingBottom: 10,
								borderBottomWidth: 1,
								borderColor: Colors.lightBorder,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.lightFont,
										marginRight: 5,
									},
								]}
							>
								{"Discount"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${totalDiscount.toFixed(2)}`}
								</Text>
							</View>
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingVertical: 15,
								borderBottomWidth: 1,
								borderColor: Colors.lightBorder,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.lightFont,
										marginRight: 5,
									},
								]}
							>
								{"Discounted Price"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${itemPriceAfterDiscount.toFixed(2)}`}
								</Text>
							</View>
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingVertical: 15,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.primaryBtn,
										marginRight: 5,
									},
								]}
							>
								{"Total Paid"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${
										orderItemData?.targetedPrice?.code
									} ${itemPriceAfterDiscount.toFixed(2)}`}
								</Text>
							</View>
						</View>
					</>
				</BottomSheet>

				<BottomSheet
					isVisible={this.state.isOrderPriceModalOpen}
					title={"Payment Information"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.5) }}
					onClose={this.onCloseOrderPriceModal}
				>
					<>
						<View
							style={{
								marginHorizontal: 15,
								marginBottom: 10,
							}}
						>
							{this.state.orderItems.map((item: any, index: any) => {
								return (
									<View
										style={{ width: "100%", flexDirection: "row" }}
										key={`-${index}`}
									>
										<View
											style={{
												width: "65%",
												// alignItems: "center",
											}}
										>
											<Text
												style={[
													{
														fontFamily: "Roboto-Regular",
														fontWeight: "400",
														fontSize: 14,
														lineHeight: 30,
														color: Colors.lightFont,
													},
												]}
												numberOfLines={1}
												ellipsizeMode="tail"
											>{`${item.quantity} x ${item.product.name}`}</Text>
										</View>
										<View style={{ width: "35%" }}>
											<Text
												style={{
													fontFamily: "Roboto-Medium",
													fontWeight: "500",
													fontSize: 14,
													lineHeight: 30,
													color: Colors.secondaryFont,
													textAlign: "right",
												}}
											>{`${Number(item.targetedPrice.value).toFixed(2)}`}</Text>
										</View>
									</View>
								);
							})}
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingBottom: 10,
								borderBottomWidth: 1,
								borderColor: Colors.lightBorder,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.lightFont,
									},
								]}
							>
								{"Discount"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${Number(this.state.overallDiscount).toFixed(2)}`}
								</Text>
							</View>
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingVertical: 15,
								borderBottomWidth: 1,
								borderColor: Colors.lightBorder,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.lightFont,
										marginRight: 5,
									},
								]}
							>
								{"Discounted Price"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.secondaryFont,
									}}
								>
									{`${Number(this.state.orderAmount).toFixed(2)}`}
								</Text>
							</View>
						</View>
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								marginHorizontal: 15,
								paddingVertical: 15,
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.primaryBtn,
										marginRight: 5,
									},
								]}
							>
								{"Total Paid"}
							</Text>
							<View>
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 14,
										lineHeight: 30,
										color: Colors.primaryBtn,
									}}
								>
									{`${this.state.orderCurrency} ${Number(
										this.state.orderAmount
									).toFixed(2)}`}
								</Text>
							</View>
						</View>
					</>
				</BottomSheet>
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 0,
		paddingTop: 25,
	},
	orderItemDetails: {
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		alignSelf: "center",
		backgroundColor: Colors.white,
		paddingBottom: 10,
	},
	productImage: {
		width: 80,
		height: 80,
		borderRadius: 8,
		alignSelf: "center",
	},
	eSimTitleView: {
		marginVertical: 10,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},

	eSimTitleText: {
		color: Colors.primary,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 26,
	},
	eSimSubTitleText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 14,
	},

	orderDetailView: {
		width: "100%",
		// paddingHorizontal: 15,
		marginTop: 10,
	},

	orderDetail: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	orderDetailHeading: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
	},
	itemDetailsView: {
		flexDirection: "row",
		width: "100%",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 10,
		paddingVertical: 10,
	},

	barCodeImage: {
		height: 120,
		width: 120,
		borderWidth: 2,
		borderColor: Colors.lightGrey,
		objectFit: "fill",
	},
	lightTextItemDetails: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
	boldTextItemDetails: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		marginBottom: 5,
		color: Colors.primaryFont,
		opacity: 0.9,
	},
	buttonView: {
		width: "100%",
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		// justifyContent: "space-around",
		borderColor: Colors.lightGrey,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		backgroundColor: "white",
	},
	btn: {
		alignItems: "center",
		justifyContent: "center",
		padding: 15,
	},

	verticalLine: {
		borderWidth: 0.8,
		borderColor: Colors.lightGrey,
		height: "100%",
		alignItems: "center",
		justifyContent: "center",
	},

	boldText: {
		fontSize: 16,
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

	priceDetails: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "white",
		paddingHorizontal: 15,
	},
	totalPrice: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		borderColor: Colors.greyBtnBg,
		borderTopWidth: 1,
		backgroundColor: Colors.white,
		paddingVertical: 10,
	},

	viewBreakupText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryBtn,
		fontSize: 12,
		textAlign: "right",
	},

	rechargeAndBills: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.white,
		alignSelf: "center",
		width: "100%",
		marginTop: 15,
	},
	itemHeading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: Colors.primaryFont,
		opacity: 0.9,
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
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
	cardBody: {
		padding: 10,
	},
	regularText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		opacity: 1,
		lineHeight: 18,
	},

	tabComponent: {
		flex: 1,
		paddingHorizontal: 20,
	},

	tabContainer: {
		borderTopWidth: 1,
		borderTopColor: Colors.lightGrey,
		width: "100%",
		height: 50,
		flexDirection: "row",
	},
	tab: {
		width: "100%",
		flex: 1,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightGrey,
	},
	activeTab: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.primaryBtn,
	},
	tabText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 0.8,
	},
	activeTabText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 1,
	},
	paymentInfoWarpper: {
		paddingLeft: 20,
	},
	paymentInfoBox: {
		width: "100%",
		minHeight: 80,
		borderLeftWidth: 1,

		borderLeftColor: Colors.secondaryBtn,
	},
	paymentIndicator: {
		position: "absolute",
		left: 13,
		top: 0,
		height: 15,
		width: 15,
		borderRadius: 100,
		backgroundColor: Colors.secondaryBtn,
		alignItems: "center",
		justifyContent: "center",
	},
	payInfoName: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.primaryFont,
		marginBottom: 3,
		opacity: 0.9,
	},
	payInfoDescBox: {
		width: "100%",
		minHeight: 50,
		paddingLeft: 20,
		paddingTop: 3,
		borderLeftWidth: 0,
		marginBottom: 20,
	},
	payInfoDesc: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.secondaryFont,
		marginBottom: 3,
		opacity: 0.9,
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
	totalText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.black,
		fontSize: 16,
	},
	item: {
		marginVertical: 10,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	title: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.black,
		fontSize: 16,
	},
	subTitle: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	subTitleText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
});
