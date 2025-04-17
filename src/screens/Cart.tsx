import React from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	FlatList,
	Alert,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendar } from "@fortawesome/pro-light-svg-icons/faCalendar";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
// import { faLocationDot } from "@fortawesome/pro-light-svg-icons/faLocationDot";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faTrashCan } from "@fortawesome/pro-light-svg-icons/faTrashCan";
import { faCartCircleExclamation } from "@fortawesome/pro-light-svg-icons/faCartCircleExclamation";
import moment from "moment-timezone";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	Button,
	OverlayLoader,
} from "../components";
import Coupons from "../components/Coupons";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { CartScreenProps } from "../navigation/NavigationTypes";
import CartService from "../services/CartService";
import CouponService from "../services/CouponService";
import { toUpperCaseWord } from "../utils/Util";
import AppContext, { UserDataModel, SearchItem } from "../context/AppContext";
import ProductCategory from "../configs/ProductCategory";

type States = {
	cartId: undefined | string;
	cartItems: Array<any>;
	allCoupons: Array<any>;
	appliedCoupons: Array<any>;
	discountApplicable: number;
	productCurrencyCode: string;
	isLoading: boolean;
	showLoader: boolean;
};

export default class Cart extends React.Component<CartScreenProps, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: CartScreenProps) {
		super(props);

		this.state = {
			cartId: undefined,
			cartItems: [],
			allCoupons: [],
			appliedCoupons: [],
			discountApplicable: 0,
			productCurrencyCode: "",
			isLoading: true,
			showLoader: false,
		};
	}

	componentDidMount = () => {
		const { userData } = this.context;
		const userId: string = userData?._id as string;
		const toCurrency: string = userData?.currency.code as string;
		const reqData = {
			customerId: userId,
			expiredOn: moment().format("YYYY-MM-DD"),
		};

		Promise.all([
			CartService.get(userId, toCurrency),
			CouponService.getAll(reqData),
		])
			.then((response: Array<any>) => {
				const cartResponse: any = response[0];
				if (cartResponse.check === true) {
					const cartData: any = cartResponse.data;
					this.setState({ productCurrencyCode: cartData.items[0].price.code });
					const allAppliedCoupons: Array<any> = [];
					let discount = 0;

					const allItems: Array<any> = (cartData.items || []).map(
						(item: any) => ({ ...item, error: null })
					);

					if (cartData.coupon !== null) {
						const coupon: any = cartData.coupon;
						discount += Number(coupon.discount);
						allAppliedCoupons.push({ _id: coupon._id, code: coupon.code });
					}

					allItems.forEach((item: any) => {
						const coupon = item.coupon;
						if (coupon !== null) {
							discount += Number(coupon.discount);

							const index: number = allAppliedCoupons.findIndex(
								(element: any) => element._id === coupon._id
							);
							if (index === -1) {
								allAppliedCoupons.push({ _id: coupon._id, code: coupon.code });
							}
						}
					});

					this.setState({
						cartId: cartData._id,
						cartItems: allItems,
						allCoupons: response[1],
						appliedCoupons: allAppliedCoupons,
						discountApplicable: discount,
						isLoading: false,
					});
				} else {
					this.setState({
						cartId: undefined,
						cartItems: [],
						allCoupons: [],
						appliedCoupons: [],
						discountApplicable: 0,
						isLoading: false,
					});
				}
			})
			.catch((error: any) => {
				this.setState({ isLoading: false });
			});
	};

	gotoBack = () => {
		this.props.navigation.pop(1);
	};

	getCartValue = (): number => {
		const { cartItems } = this.state;
		let subTotal: number = 0;

		(cartItems || []).forEach((item) => {
			const quantity: number = Number(item.quantity);
			const price: number = Number(item.price.value) * quantity;
			subTotal += price;
		});

		return subTotal;
	};

	onRemoveCartItem = (cartItemId: string) => {
		Alert.alert(LocalizedText.REMOVE_ITEM, LocalizedText.REMOVE_ITEM_MASSAGE, [
			{ text: LocalizedText.NO, style: "cancel" },
			{
				text: LocalizedText.YES,
				onPress: () => {
					const { userData } = this.context;
					const userId: string = userData?._id as string;
					const toCurrency: string = userData?.currency.code as string;

					this.setState({ showLoader: true }, () => {
						const reqData = {
							customerId: userId,
							itemId: cartItemId,
						};
						CartService.delete(reqData)
							.then((res: any) => {
								CartService.get(userId, toCurrency)
									.then((response: any) => {
										if (response.check === true) {
											const cartData: any = response.data;
											const allItems = Array.isArray(cartData.items)
												? cartData.items
												: [];
											const allAppliedCoupons: Array<any> = [];
											let discount = 0;

											if (cartData.coupon !== null) {
												const coupon: any = cartData.coupon;
												discount += Number(coupon.discount);
												allAppliedCoupons.push({
													_id: coupon._id,
													code: coupon.code,
												});
											}

											allItems.forEach((item: any) => {
												const coupon = item.coupon;
												if (coupon !== null) {
													// discount += Number(coupon.discount);
													// allAppliedCoupons.push({
													// 	_id: coupon._id,
													// 	code: coupon.code,
													// });
													discount += Number(coupon.discount);
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

											this.setState(
												{
													cartId: cartData._id,
													cartItems: allItems,
													appliedCoupons: allAppliedCoupons,
													discountApplicable: discount,
													showLoader: false,
												},
												() => {
													const totalCartItems: number =
														Number(userData?.total_cart_items) - 1;
													this.context.setUserData({
														...(userData as UserDataModel),
														total_cart_items: totalCartItems,
													});
												}
											);
										} else {
											this.setState(
												{
													cartId: undefined,
													cartItems: [],
													appliedCoupons: [],
													discountApplicable: 0,
													showLoader: false,
												},
												() => {
													this.context.setUserData({
														...(userData as UserDataModel),
														total_cart_items: 0,
													});
												}
											);
										}
									})
									.catch((error) => {
										this.setState({ showLoader: false });
									});
							})
							.catch((error) => {
								this.setState({ showLoader: false });
							});
					});
				},
			},
		]);
	};

	onApplyCoupon = (code: string) => {
		const { userData } = this.context;
		const userId: string = userData?._id as string;
		const toCurrency: string = userData?.currency.code as string;

		this.setState({ showLoader: true }, () => {
			const reqData = {
				customerId: userId,
				couponCode: code,
			};

			CartService.applyCoupon(reqData)
				.then((res: any) => {
					if (res.check === true) {
						CartService.get(userId, toCurrency)
							.then((response: any) => {
								const cartData: any = response.data;
								const allItems = Array.isArray(cartData.items)
									? cartData.items
									: [];
								const allAppliedCoupons: Array<any> = [];
								let discount = 0;

								if (cartData.coupon !== null) {
									const coupon: any = cartData.coupon;
									discount += Number(coupon.discount);
									allAppliedCoupons.push({
										_id: coupon._id,
										code: coupon.code,
									});
								}

								allItems.forEach((item: any) => {
									const coupon = item.coupon;
									if (coupon !== null) {
										discount += Number(coupon.discount);
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

								this.setState({
									cartId: cartData._id,
									cartItems: allItems,
									appliedCoupons: allAppliedCoupons,
									discountApplicable: discount,
									showLoader: false,
								});
							})
							.catch((error) => {
								this.setState({ showLoader: false });
							});
					} else {
						this.setState({ showLoader: false }, () => {
							Alert.alert("Failed", res.message);
						});
					}
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	onRemoveCoupon = (code: string) => {
		const { userData } = this.context;
		const userId: string = userData?._id as string;
		const toCurrency: string = userData?.currency.code as string;

		this.setState({ showLoader: true }, () => {
			const reqData = {
				customerId: userId,
				couponCode: code,
			};

			CartService.discardCoupon(reqData)
				.then((res: any) => {
					CartService.get(userId, toCurrency)
						.then((response: any) => {
							const cartData: any = response.data;
							const allItems = Array.isArray(cartData.items)
								? cartData.items
								: [];
							const allAppliedCoupons: Array<any> = [];
							let discount = 0;

							if (cartData.coupon !== null) {
								const coupon: any = cartData.coupon;
								discount += Number(coupon.discount);
								allAppliedCoupons.push({
									_id: coupon._id,
									code: coupon.code,
								});
							}

							allItems.forEach((item: any) => {
								const coupon = item.coupon;
								if (coupon !== null) {
									discount += Number(coupon.discount);
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

							this.setState({
								cartId: cartData._id,
								cartItems: allItems,
								appliedCoupons: allAppliedCoupons,
								discountApplicable: discount,
								showLoader: false,
							});
						})
						.catch((error) => {
							this.setState({ showLoader: false });
						});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	onAddMore = () => {
		const { getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();
		if (searchData !== null) {
			this.props.navigation.pop(4);
		} else {
			this.props.navigation.goBack();
		}
	};

	onCheckout = () => {
		const { cartItems } = this.state;
		const now: string = moment.utc().format("YYYY-MM-DD HH:mm:ss");
		const checkOutItems: Array<any> = cartItems.map((item: any) => {
			if (
				[
					ProductCategory.LOUNGE,
					ProductCategory.MEET_AND_GREET,
					ProductCategory.MOBILITY_ASSIST,
					ProductCategory.PORTER,
				].includes(item.category)
			) {
				const bookingDateTime: string =
					moment.utc(item.bookingDate).format("YYYY-MM-DD") +
					` ${item.slot.start}:00:00`;
				const isBefore: boolean = moment(
					moment.utc(bookingDateTime, "YYYY-MM-DD HH:mm:ss")
				).isSameOrBefore(moment.utc(now, "YYYY-MM-DD HH:mm:ss"));

				return {
					...item,
					error: isBefore
						? "Booking date and time must be greater than from current date and time"
						: null,
				};
			} else {
				return item;
			}
		});

		const errorItems: Array<any> = checkOutItems.filter(
			(item: any) => typeof item.error !== "undefined" && item?.error !== null
		);

		if (errorItems.length > 0) {
			this.setState({ cartItems: checkOutItems }, () => {
				return false;
			});
		} else {
			this.setState({ showLoader: true }, () => {
				CartService.checkout()
					.then((response: any) => {
						if (response.check === true) {
							this.setState({ showLoader: false }, () => {
								const { userData } = this.context;
								const { discountApplicable, productCurrencyCode } = this.state;
								// const currency: string = userData?.currency.code as string;
								const currency: string = productCurrencyCode as string;
								const totalCartAmount: number = this.getCartValue();

								this.setState({ showLoader: false }, () => {
									this.props.navigation.navigate("Payment", {
										orderAmount: Number(
											(totalCartAmount - discountApplicable).toFixed(2)
										),
										currency: currency,
										cartId: this.state.cartId,
									});
								});
							});
						} else {
							const errorItems: Array<any> = response.data;
							const modCartItems: Array<any> = cartItems.map((item: any) => {
								const _id: string = item._id.toString();
								const index: number = errorItems.findIndex(
									(element: any) => element._id.toString() === _id
								);
								if (index > -1) {
									const data: any = errorItems[index];
									return { ...item, error: data.message };
								} else {
									return item;
								}
							});

							this.setState({ cartItems: modCartItems, showLoader: false });
						}
					})
					.catch((error) => {
						this.setState({ showLoader: false });
					});
			});
		}
	};

	renderItem = ({ item }: any) => {
		const quantity: number = Number(item.quantity);
		const discount: number =
			item.coupon !== null ? Number(item.coupon.discount) : 0;
		const amount: number = Number(item.price.value) * quantity;
		const netAmount: number = amount - discount;

		return (
			<View
				style={{
					padding: 10,
					elevation: 6,
					borderRadius: 12,
					backgroundColor: Colors.white,
					marginVertical: 10,
					marginHorizontal: 15,
					flexDirection: "row",
				}}
			>
				{/* <View style={{ width: "20%" }}>
					<Image
						source={{ uri: item.service.thumbnail }}
						style={{
							height: 50,
							width: 50,
							borderRadius: 8,
						}}
						resizeMode="cover"
					/>
				</View> */}
				<View style={{ width: "70%", paddingHorizontal: 5 }}>
					<Text style={styles.title}>{item.product.name}</Text>
					<Text style={styles.subTitle}>
						{toUpperCaseWord(item.category.toLowerCase().replace(/_/g, " "))}
					</Text>
					{item.category === ProductCategory.E_SIM ? (
						<>
							<Text style={[styles.subTitle, { marginBottom: 1 }]}>
								{`${item.selectedPlan} (${item.selectedPlanSize} GB)`}
							</Text>
							{/* <Text
								style={styles.subTitle}
							>{`${item.selectedPlanSize}GB`}</Text> */}
						</>
					) : null}
					{item.category !== ProductCategory.E_SIM ? (
						<>
							{typeof item.slot !== "undefined" ? (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginTop: 5,
									}}
								>
									<FontAwesomeIcon
										size={10}
										icon={faClock}
										color={Colors.secondaryFont}
										style={{ marginRight: 5, opacity: 0.9 }}
									/>
									<Text style={styles.desc}>
										{`${item.slot.start} - ${item.slot.end} H`}
									</Text>
								</View>
							) : null}

							{typeof item.bookingDate !== "undefined" ? (
								<View
									style={{
										flexDirection: "row",
										alignItems: "center",
										marginTop: 3,
									}}
								>
									<FontAwesomeIcon
										size={11}
										icon={faCalendar}
										color={Colors.secondaryFont}
										style={{ marginRight: 5, opacity: 0.9 }}
									/>
									<Text style={styles.desc}>
										{moment.utc(item.bookingDate).format("D MMMM, YYYY")}
									</Text>
								</View>
							) : null}
						</>
					) : null}
					{item.error !== null ? (
						<Text style={styles.errorText}>{item.error}</Text>
					) : null}
				</View>
				<View
					style={{
						width: "30%",
						justifyContent: "space-between",
					}}
				>
					<View style={{ alignItems: "flex-end" }}>
						<Text style={styles.desc}>{`x${quantity}`}</Text>
						{item.price.code !== item.targetedPrice.code ? (
							<Text
								style={{
									fontSize: 12,
									fontFamily: "Roboto-Regular",
									fontWeight: "400",
									color: Colors.secondaryFont,
									textAlign: "right",
								}}
							>{`${item.targetedPrice.code} ${item.targetedPrice.value.toFixed(
								2
							)}`}</Text>
						) : null}

						<Text style={styles.amt}>
							{`${item.price.code} ${amount.toFixed(2)}`}
						</Text>
						{/* {amount !== netAmount ? (
							<Text style={styles.actualAmt}>{amount.toFixed(2)}</Text>
						) : null}
						<Text style={styles.amt}>
							{`${item.price.code} ${netAmount.toFixed(2)}`}
						</Text> */}
					</View>

					<TouchableOpacity
						onPress={this.onRemoveCartItem.bind(this, item._id)}
						style={{
							marginTop: 10,
							alignItems: "flex-end",
						}}
					>
						<FontAwesomeIcon
							size={18}
							icon={faTrashCan}
							color={Colors.danger}
						/>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<View
			style={{
				flex: 0.8,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			{/* <FontAwesomeIcon
				size={60}
				icon={faCartCircleExclamation}
				color={Colors.secondaryFont}
			/> */}

			<Image
				source={require("../assets/images/empty-cart.png")}
				style={{ width: 150, height: 150, marginBottom: 10 }}
			/>

			<Text
				style={[
					{
						fontSize: 20,
						fontFamily: "Roboto-Medium",
						fontWeight: "500",
						color: Colors.secondaryFont,
						lineHeight: 28,
					},
				]}
			>
				{"Hey, it's empty!"}
			</Text>

			<Text
				style={{
					marginTop: 10,
					textAlign: "center",
					fontFamily: "Roboto-Regular",
					fontWeight: "400",
					fontSize: 16,
					color: Colors.lightFont,
					marginHorizontal: 25,
				}}
			>
				{"There is nothing in your cart. Let's add some items."}
			</Text>

			<Button
				title={"Let's Shop"}
				onPress={this.gotoBack}
				style={{
					height: 45,
					width: "70%",
					marginTop: 20,
				}}
			/>
		</View>
	);

	getListFooterComponent = () => {
		const { userData } = this.context;
		const { cartItems, discountApplicable, productCurrencyCode } = this.state;
		// const currency: string = userData?.currency.code as string;
		const currency: string = productCurrencyCode as string;
		const totalCartAmount: number = this.getCartValue();
		const grossCartAmount = totalCartAmount - discountApplicable;

		return cartItems.length > 0 ? (
			<>
				<View
					style={{
						width: Constant.WINDOW_WIDTH - 30,
						marginHorizontal: 15,
						alignItems: "flex-end",
					}}
				>
					<TouchableOpacity
						onPress={this.onAddMore}
						style={{ flexDirection: "row", alignItems: "center" }}
					>
						<FontAwesomeIcon
							size={18}
							icon={faPlus}
							color={Colors.primaryBtn}
						/>
						<Text
							style={[styles.title, { fontSize: 14, color: Colors.primaryBtn }]}
						>
							{"Add more"}
						</Text>
					</TouchableOpacity>
				</View>
				<Coupons
					coupons={this.state.allCoupons}
					onApply={this.onApplyCoupon}
					onDiscard={this.onRemoveCoupon}
					appliedCoupons={this.state.appliedCoupons}
					discountApplicable={this.state.discountApplicable}
				/>
				<View style={[styles.footerRow, { marginTop: 20 }]}>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{LocalizedText.SUBTOTAL}
					</Text>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{`${totalCartAmount.toFixed(2)}`}
					</Text>
				</View>
				<View style={styles.footerRow}>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{LocalizedText.DISCOUNT}
					</Text>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{`${this.state.discountApplicable.toFixed(2)}`}
					</Text>
				</View>
				<View style={styles.footerRow}>
					<Text style={styles.title}>{LocalizedText.TOTAL}</Text>
					<Text style={styles.title}>
						{`${currency} ${grossCartAmount.toFixed(2)}`}
					</Text>
				</View>
				<View
					style={{
						marginBottom: 5,
						paddingHorizontal: 15,
						marginTop: 50,
					}}
				>
					<Button
						title={LocalizedText.PROCEED_TO_CHECKOUT}
						onPress={this.onCheckout}
					/>
				</View>
			</>
		) : null;
	};

	render = () => (
		<Container>
			<Header title={LocalizedText.MY_CART} />

			<WhiteContainer style={styles.container}>
				{this.state.isLoading ? (
					<Loader />
				) : (
					<FlatList
						data={this.state.cartItems}
						renderItem={this.renderItem}
						keyExtractor={this.keyExtractor}
						initialNumToRender={this.state.cartItems.length}
						ListFooterComponent={this.getListFooterComponent.bind(this)}
						ListEmptyComponent={this.getListEmptyComponent.bind(this)}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps={"handled"}
						contentContainerStyle={
							this.state.cartItems.length <= 0 ? { flex: 1 } : null
						}
					/>
				)}
			</WhiteContainer>

			<OverlayLoader visible={this.state.showLoader} />
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 10,
		paddingHorizontal: 0,
	},
	title: {
		fontSize: 18,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	subTitle: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	desc: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	actualAmt: {
		opacity: 0.9,
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		marginTop: 3,
		textDecorationLine: "line-through",
		color: Colors.secondaryFont,
	},
	amt: {
		fontSize: 16,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		textAlign: "right",
	},
	footerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		paddingVertical: 5,
	},
	errorText: {
		fontSize: 11,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.danger,
		marginTop: 3,
	},
});
