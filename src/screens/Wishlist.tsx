import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import React, { useContext, useState } from "react";
//@ts-ignore
import Counter from "react-native-counters";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTrashCan } from "@fortawesome/pro-light-svg-icons/faTrashCan";
import { faCartCircleExclamation } from "@fortawesome/pro-light-svg-icons/faCartCircleExclamation";
import { WishlistScreenProps } from "../navigation/NavigationTypes";
import { Button, Container, Header, WhiteContainer } from "../components";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";
import Constant from "../configs/Constant";
import Coupons from "../components/Coupons";
import WishlistContext from "../context/WishlistContext";

const allCoupons = [
	{
		_id: "661e44c13986fc0afd999021",
		applicableOn: "CUSTOMER",
		code: "WELCOME20",
		currencyCode: "USD",
		description: "Get flat USD 20 off on your first order",
		discountType: "FLAT",
		discountValue: 20,
		expiredOn: "2024-05-31T00:00:00.000Z",
	},
];

const Wishlist: React.FC<WishlistScreenProps> = (
	props: WishlistScreenProps
): React.ReactElement => {
	const context2 = useContext(WishlistContext);
	const allItems: Array<any> = context2.wishlist;
	const [discountApplicable, setDiscountApplicable] = useState<number>(0);
	const [appliedCoupons, setAppliedCoupons] = useState<Array<any>>([]);
	const [discountVal, setDiscountVal] = useState<any>(0);
	// const [quantity, setQuantity] = useState<number>(1);
	const [newData, setNewData] = useState<Array<any>>([]);

	const onChangeQuantity = (value: number, itemId: string) => {
		context2.updateWishlist(itemId, value);
	};

	const gotoBack = () => {
		props.navigation.pop(2);
	};

	const removeWishlistItem = (itemID: string) => {
		context2.removeFromWishlist(itemID);
	};

	const onAddMore = () => {
		props.navigation.pop(4);
	};

	const onApplyCoupon = (item: any) => {
		const filterCoupon: any = allCoupons.find((elem) => elem.code === item);
		const allAppliedCoupons: Array<any> = [];
		allAppliedCoupons.push({
			_id: filterCoupon._id,
			code: filterCoupon.code,
		});

		setDiscountVal(filterCoupon?.discountValue);
		setAppliedCoupons(allAppliedCoupons);
	};

	const onRemoveCoupon = (item: any) => {
		setDiscountVal(0);
		setAppliedCoupons([]);
	};

	const onPrebook = (total: number) => {
		props.navigation.navigate("Prebook", { amount: total });
	};

	const getTotalValue = (): number => {
		const allItems = context2.wishlist;
		let subTotal: number = 0;

		(allItems || []).forEach((item) => {
			const quantity: number = Number(item.quantity);
			const price: number = Number(item.price) * quantity;
			subTotal += price;
		});

		return subTotal;
	};

	const getListEmptyComponent = () => (
		<View
			style={{
				flex: 0.7,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<FontAwesomeIcon
				size={60}
				icon={faCartCircleExclamation}
				color={Colors.secondaryFont}
			/>

			<Text style={[styles.title, { lineHeight: 28 }]}>{"Empty Wishlist"}</Text>

			<Button
				title={LocalizedText.CONTINUE_SHOPPING}
				onPress={gotoBack}
				style={{
					height: 45,
					width: "70%",
					marginTop: 20,
				}}
			/>
		</View>
	);

	const keyExtractor = (item: any) => item._id;

	const getListFooterComponent = () => {
		const totalCartAmount: number = getTotalValue();
		const total: number = Number(totalCartAmount) - Number(discountVal);

		return allItems.length > 0 ? (
			<>
				<View
					style={{
						width: Constant.WINDOW_WIDTH - 30,
						marginHorizontal: 15,
						alignItems: "flex-end",
					}}
				></View>
				<Coupons
					coupons={allCoupons}
					onApply={onApplyCoupon}
					onDiscard={onRemoveCoupon}
					appliedCoupons={appliedCoupons}
					discountApplicable={discountApplicable}
				/>
				<View style={[styles.footerRow, { marginTop: 20 }]}>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{LocalizedText.SUBTOTAL}
					</Text>
					<Text
						style={[styles.subTitle, { fontSize: 14 }]}
					>{`${totalCartAmount.toFixed(2)}`}</Text>
				</View>
				<View style={styles.footerRow}>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>
						{LocalizedText.DISCOUNT}
					</Text>
					<Text style={[styles.subTitle, { fontSize: 14 }]}>{`${Number(
						discountVal
					).toFixed(2)}`}</Text>
				</View>
				<View style={styles.footerRow}>
					<Text style={styles.title}>{LocalizedText.TOTAL}</Text>
					<Text style={styles.title}>{`USD ${Number(total).toFixed(2)}`}</Text>
				</View>
				<View
					style={{
						marginBottom: 5,
						paddingHorizontal: 15,
						marginTop: 30,
					}}
				>
					<Button title={"Pre-book"} onPress={() => onPrebook(total)} />
				</View>
				<View
					style={{
						marginBottom: 15,
						paddingHorizontal: 15,
						marginTop: 5,
					}}
				>
					<Button
						title={"Shop More"}
						style={styles.shopMoreBtn}
						titleStyle={styles.shopMoreBtnTxt}
						onPress={onAddMore}
					/>
				</View>
			</>
		) : null;
	};

	const renderItem = ({ item, index }: any) => {
		const quantity: number = Number(item.quantity);
		const itemAmount: number = Number(item.price) * quantity;

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
				<View style={{ width: "20%" }}>
					<Image
						source={{ uri: item.image }}
						style={{
							height: 75,
							width: 75,
							borderRadius: 8,
						}}
						resizeMode="cover"
					/>
				</View>
				<View style={{ width: "50%", paddingHorizontal: 5 }}>
					<Text style={styles.title}>{item.name}</Text>
					<Text style={[styles.descText, { marginTop: 2 }]}>{item.type}</Text>
					<Text style={styles.descText}>{item.category}</Text>

					{/* {item.error !== null ? (
						<Text style={styles.errorText}>{item.error}</Text>
					) : null} */}
				</View>
				<View
					style={{
						width: "30%",
						justifyContent: "space-between",
					}}
				>
					<View style={{ alignItems: "flex-end" }}>
						{/* <Text style={styles.desc}>{`x${item.quantity}`}</Text> */}
						<Counter
							start={item.quantity}
							min={1}
							// max={
							// 	parseInt(this.state.selectedSlot.totalCapacity) -
							// 	parseInt(this.state.selectedSlot.totalBooked)
							// }
							max={10}
							onChange={(e: any) => onChangeQuantity(e, item._id)}
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

						{/* <Text style={styles.actualAmt}>{item.oldPrice}</Text> */}

						<Text style={[styles.amt, { marginTop: 5 }]}>{`${
							item.currencyCode
						} ${Number(itemAmount).toFixed(2)}`}</Text>
					</View>

					<TouchableOpacity
						onPress={() => removeWishlistItem(item._id)}
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

	return (
		<Container>
			<Header title="Wishlist" />
			<WhiteContainer style={{ paddingTop: 0, paddingHorizontal: 0 }}>
				<FlatList
					data={allItems}
					renderItem={renderItem}
					keyExtractor={keyExtractor}
					ListEmptyComponent={getListEmptyComponent}
					initialNumToRender={allItems.length}
					ListFooterComponent={getListFooterComponent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps={"handled"}
					contentContainerStyle={allItems.length <= 0 ? { flex: 1 } : null}
				/>
			</WhiteContainer>
		</Container>
	);
};

export default Wishlist;

const styles = StyleSheet.create({
	title: {
		fontSize: 16,
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
		fontSize: 13,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
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
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	shopMoreBtn: {
		backgroundColor: Colors.white,
		borderColor: Colors.primaryBtn,
	},
	shopMoreBtnTxt: {
		color: Colors.primaryBtn,
	},
	modalRegularText: {
		fontSize: 15,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.9,
	},
});
