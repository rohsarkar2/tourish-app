import React, { useContext, useState } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
//@ts-ignore
import Counter from "react-native-counters";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons/faPlus";
import Snackbar from "react-native-snackbar";
import { DutyFreeProductDetailsScreenProps } from "../../navigation/NavigationTypes";
import { Button, Container, Header, WhiteContainer } from "../../components";
import Colors from "../../configs/Colors";
import LocalizedText from "../../resources/LocalizedText";
import WishlistContext from "../../context/WishlistContext";

const shopProducts: Array<any> = [
	{
		name: "Liquor",
		image: require("../../assets/images/Liquor-logo.png"),
		products: [
			{
				_id: "001",
				name: "Jack Daniels",
				category: "Liquor",
				type: "Tennessee Whiskey",
				origin: "Old No. 7 1|",
				discount: "10",
				oldPrice: "50",
				currencyCode: "USD",
				price: "47",
				img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0-M2xlJo3_LM_fxRpWGlE3tlIezQo6Qn0cLKZB5kq5g&s",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
			{
				_id: "002",
				name: "The Glenlivet",
				category: "Liquor",
				type: "Tennessee Whiskey",
				origin: "Old No. 7 1|",
				discount: "20",
				oldPrice: "60",
				currencyCode: "USD",
				price: "54",
				img: "https://delhidutyfree.co.in/media/catalog/product/cache/d58eb6b6cd0b875591a577c8f7a3618e/2/0/2001497_8_eckywmacg05ib1hk.jpg",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
			{
				_id: "003",
				name: "Hendricks",
				category: "Liquor",
				type: "Tennessee Whiskey",
				origin: "Old No. 7 1|",
				discount: "10",
				oldPrice: "80",
				currencyCode: "USD",
				price: "70",
				img: "https://delhidutyfree.co.in/media/catalog/product/cache/d58eb6b6cd0b875591a577c8f7a3618e/2/0/2000248_4_gocuxghyyftzem1g.jpg",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
			{
				_id: "004",
				name: "Monkey 47",
				category: "Liquor",
				type: "Tennessee Whiskey",
				origin: "Old No. 7 1|",
				discount: "15",
				oldPrice: "100",
				currencyCode: "USD",
				price: "85",
				img: "https://mansionz.in/cdn/shop/files/MONKEY47SCHWARZWALDDRYGIN.png?v=1692172216",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
			{
				_id: "005",
				name: "Blue label",
				category: "Liquor",
				type: "Cote Du Rhone",
				discount: "15",
				origin: "Reserve Rouge 75cl",
				oldPrice: "100",
				currencyCode: "USD",
				price: "85",
				img: "https://delhidutyfree.co.in/media/catalog/product/cache/d58eb6b6cd0b875591a577c8f7a3618e/j/o/johnnie_walker_blue_label_xordinaire_2.jpg",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
			{
				_id: "006",
				name: "DIOR",
				category: "Liquor",
				type: "The Original Irish",
				origin: "Cream Liqueur",
				discount: "20",
				oldPrice: "130",
				currencyCode: "USD",
				price: "110",
				img: "https://delhidutyfree.co.in/media/catalog/product/cache/d58eb6b6cd0b875591a577c8f7a3618e/b/a/baileys_original.jpg",
				description:
					"Double Black, Johnnie Walker's boldest and most intense Blended Scotch Whisky, is the darker interpretation of the iconic blend Johnnie Walker Black Label with double the smoke and double the intensity. Derived from blending",
			},
		],
	},
	{
		name: "Beauty",
		image: require("../../assets/images/Beauty-logo.png"),
		products: [
			{
				_id: "011",
				name: "DIOR",
				category: "Beauty",
				type: "Dior Savage Perfume",
				origin: "100 ml",
				discount: "10",
				oldPrice: "120",
				currencyCode: "USD",
				price: "117",
				img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrR28aa-BKuxiy1qE1gxeYvHgxoP5meLCrHQ&s",
				description:
					"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
			},
			{
				_id: "012",
				name: "BOBBI BROWN",
				category: "Beauty",
				type: "Bobbi Brown Skin",
				origin: "Concealer Stick Natural",
				discount: "10",
				oldPrice: "120",
				currencyCode: "USD",
				price: "117",
				img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIrqDt-vhPqSb5frzVNOEKrUaUMWlPcRw4MyCvm3vUzw&s",
				description:
					"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
			},
		],
	},
	{
		name: "Accessories",
		image: require("../../assets/images/Accessories-logo.png"),
		products: [
			{
				_id: "111",
				name: "Bracelet",
				category: "Accessories",
				type: "Hand-type",
				origin: "Pure Homemade",
				discount: "10",
				oldPrice: "120",
				currencyCode: "USD",
				price: "117",
				img: "https://www.artscrafted.com/cdn/shop/files/Raveena_1.2.jpg?v=1697641309",
				description:
					"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
			},
		],
	},
	{
		name: "Electronics",
		image: require("../../assets/images/Electronics-logo.png"),
		products: [
			{
				_id: "211",
				name: "Iphone 13 (Red)",
				category: "Electronics",
				type: "Mobile Phone",
				origin: "Apple",
				discount: "10",
				oldPrice: "625",
				currencyCode: "USD",
				price: "617",
				img: "https://cellbuddy.in/buddy/wp-content/uploads/2022/09/13-red.png",
				description:
					"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
			},
		],
	},
	{
		name: "Tobacco",
		image: require("../../assets/images/Tobacco-logo.png"),
		products: [],
	},
	{
		name: "Voucher",
		image: require("../../assets/images/Vouchers-logo.png"),
		products: [],
	},
];

const DutyFreeProductDetails: React.FC<DutyFreeProductDetailsScreenProps> = (
	props: DutyFreeProductDetailsScreenProps
): React.ReactElement => {
	const context2 = useContext(WishlistContext);
	const [showMoreInformationModal, setShowMoreInformationModal] =
		useState<boolean>(false);
	const [quantity, setQuantity] = useState<number>(1);
	const [isQuantityChanged, setIsQuantityChanged] = useState<boolean>(false);

	const productsBasedonType: any = shopProducts.find(
		(item) => item.name === props.route.params.itemType
	);

	const allProducts: Array<any> =
		typeof productsBasedonType !== "undefined"
			? productsBasedonType.products
			: [];

	const productItem: any = allProducts.find(
		(item) => item._id === props.route.params.itemId
	);

	const onChangeQuantity = (value: number, type: any) => {
		setQuantity(value);
		// setIsQuantityChanged(true);
	};

	// const openMoreInfoModal = () => {
	// 	setShowMoreInformationModal(true);
	// };

	// const closeMoreInfoModal = () => {
	// 	setShowMoreInformationModal(false);
	// };

	const onAddtoWishlist = () => {
		let wishlistBody = {
			_id: productItem._id,
			name: productItem.name,
			price: productItem.price,
			type: productItem.type,
			quantity: quantity,
			image: productItem.img,
			category: productItem.category,
			currencyCode: productItem.currencyCode,
		};
		setTimeout(() => {
			Snackbar.show({
				text: "Item added to your Wishlist.",
				duration: Snackbar.LENGTH_LONG,
				action: {
					text: "View",
					textColor: Colors.secondary,
					onPress: gotoWishlist,
				},
			});
		}, 350);
		context2.addToWishlist(wishlistBody);
	};

	const updateWishlist = () => {
		setTimeout(() => {
			Snackbar.show({
				text: "Your wishlist has been updated.",
				duration: Snackbar.LENGTH_LONG,
				action: {
					text: "View",
					textColor: Colors.secondary,
					onPress: gotoWishlist,
				},
			});
		}, 350);
		context2.updateWishlist(productItem._id, quantity);
	};

	const gotoWishlist = () => {
		props.navigation.navigate("Wishlist");
	};

	let arr: Array<any> = context2.wishlist;
	let findData = arr.find((item: any) => item._id === productItem._id);

	return (
		<Container>
			<Header title={props.route.params.productItem.name} />
			<WhiteContainer style={{ paddingHorizontal: 0, paddingVertical: 15 }}>
				<ScrollView>
					<View style={styles.container}>
						<Image
							resizeMode="cover"
							source={{ uri: props.route.params.productItem.img }}
							style={styles.thumbnail}
						/>
						<View style={{ width: "100%", paddingHorizontal: 15 }}>
							<Text
								style={[styles.prevModalTitle, { fontSize: 18, marginTop: 10 }]}
							>
								{props.route.params.productItem.name}
							</Text>
							<View
								style={{
									alignItems: "center",
									justifyContent: "center",
									marginTop: 10,
								}}
							>
								<Text
									style={styles.descText}
								>{`${productItem.type} (${productItem.origin})`}</Text>
							</View>

							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
									marginTop: 10,
								}}
							>
								<Text
									style={[
										styles.descText,
										{
											marginRight: 3,
											textDecorationLine: "line-through",
										},
									]}
								>
									{`${productItem.currencyCode} ${productItem.oldPrice}`}
								</Text>
								<Text
									style={[
										styles.boldText,
										{ marginLeft: 3, color: Colors.primaryBtn, fontSize: 18 },
									]}
								>
									{`${productItem.currencyCode} ${productItem.price}`}
								</Text>
							</View>

							<View
								style={{
									width: "100%",
									flexDirection: "row",
									marginTop: 10,
									paddingHorizontal: 25,
								}}
							>
								<View style={{ flex: 1 }}>
									<Text style={[styles.boldText, { marginLeft: 30 }]}>
										{LocalizedText.QUANTITY}
									</Text>
									<View
										style={[
											{
												justifyContent: "center",
												height: 40,
												marginLeft: 20,
											},
										]}
									>
										<Counter
											start={
												typeof findData !== "undefined" ? findData.quantity : 1
											}
											min={1}
											max={10}
											onChange={onChangeQuantity}
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
								</View>
								{typeof findData !== "undefined" ? (
									<View style={{ flex: 1, marginTop: 12 }}>
										<Button
											// disabled={isQuantityChanged ? false : true}
											title="Update Wishlist"
											style={styles.addToWishlistBtn}
											titleStyle={styles.addToWishlistBtnText}
											onPress={updateWishlist}
										/>
									</View>
								) : (
									<View style={{ flex: 1, marginTop: 12 }}>
										<Button
											title="Add to Wishlist"
											style={styles.addToWishlistBtn}
											titleStyle={styles.addToWishlistBtnText}
											onPress={onAddtoWishlist}
										/>
									</View>
								)}
							</View>
							{/* )} */}

							<View style={{ marginTop: 20 }}>
								<Text style={[styles.boldText, { marginBottom: 5 }]}>
									{"Product details"}
								</Text>
								<Text
									style={{
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										fontSize: 13,
										color: Colors.secondaryFont,
										opacity: 0.6,
										textAlign: "justify",
									}}
								>
									{productItem.description}
								</Text>
							</View>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginTop: 25,
								}}
							>
								<Text style={styles.boldText}>{"More Information"}</Text>
								<TouchableOpacity>
									<FontAwesomeIcon
										icon={faPlus}
										size={18}
										color={Colors.primaryBg}
									/>
								</TouchableOpacity>
							</View>
							<View
								style={{ borderBottomWidth: 1, marginTop: 15, opacity: 0.2 }}
							/>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginTop: 10,
								}}
							>
								<Text style={styles.boldText}>{"Reserve Collect"}</Text>
								<TouchableOpacity>
									<FontAwesomeIcon
										icon={faPlus}
										size={18}
										color={Colors.primaryBg}
									/>
								</TouchableOpacity>
							</View>
							<View
								style={{ borderBottomWidth: 1, marginTop: 15, opacity: 0.2 }}
							/>
							<View
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									marginTop: 10,
								}}
							>
								<Text style={styles.boldText}>{"Exchange Converter"}</Text>
								<TouchableOpacity>
									<FontAwesomeIcon
										icon={faPlus}
										size={18}
										color={Colors.primaryBg}
									/>
								</TouchableOpacity>
							</View>
							<View
								style={{ borderBottomWidth: 1, marginTop: 15, opacity: 0.2 }}
							/>
						</View>
					</View>
				</ScrollView>
			</WhiteContainer>

			{/* <BottomSheet
				isVisible={showMoreInformationModal}
				title={"More Information"}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
				onClose={closeMoreInfoModal}
			>
				<View style={styles.modalBody}>
					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Brand"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"Jhonnie Walker"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Brand Category"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"Whisky"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Age"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"12"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Flavours"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"Spicy flavours"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Country of Origin"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"United Kingdom"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Region of Origin"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"Blended"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Whisky Style"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"Full Bodied & Smoky"}</Text>
					</View>

					<View style={styles.detailsText}>
						<Text style={styles.leftText}>{"Alcohol by Volume"}</Text>
						<Text style={styles.middleText}>:</Text>
						<Text style={styles.rightDarktxt}>{"40%"}</Text>
					</View>
				</View>
			</BottomSheet> */}
		</Container>
	);
};

export default DutyFreeProductDetails;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	thumbnail: {
		width: 250,
		height: 250,
		borderRadius: 8,
		alignSelf: "center",
		marginTop: 20,
	},
	prevModalTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 24,
		color: Colors.secondaryFont,
		textAlign: "center",
	},
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
	},
	regularText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
	},
	addToWishlistBtn: {
		justifyContent: "center",
		alignItems: "center",
		height: 40,
	},
	addToWishlistBtnText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.white,
		lineHeight: 20,
	},
	modalRegularText: {
		fontSize: 15,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.9,
	},
	modalBody: {
		padding: 20,
	},
	detailsText: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 5,
	},
	leftText: { width: 120, color: Colors.black },
	middleText: { marginRight: 20, color: Colors.black },
	rightDarktxt: {
		color: Colors.black,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		marginTop: 4,
	},
});
