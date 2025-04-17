import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Carousel from "pinar";
import { DutyFreeShopDetailsScreenProps } from "../../navigation/NavigationTypes";
import { Card, Container, Header, WhiteContainer } from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";

const bannerList: Array<any> = [
	require("../../assets/images/duty-free-banner1.jpg"),
	require("../../assets/images/duty-free-banner2.jpg"),
];

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
const DutyFreeShopDetails: React.FC<DutyFreeShopDetailsScreenProps> = (
	props: DutyFreeShopDetailsScreenProps
): React.ReactElement => {
	const airportName = props.route.params.airportName;
	const airportIATACode = props.route.params.airportIATACode;

	const goToProductSection = (item: any) => {
		props.navigation.navigate("DutyFreeProducts", {
			name: item.name,
			allProducts: item.products,
		});
	};

	return (
		<Container>
			<Header title={props.route.params.shopName} />
			<WhiteContainer
				style={{
					paddingTop: 0,
					paddingHorizontal: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				<ScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.container}>
						<View style={{ height: 200, width: "100%" }}>
							<Carousel
								loop={true}
								showsDots={true}
								showsControls={false}
								width={Constant.WINDOW_WIDTH}
								height={200}
								dotStyle={styles.carouselDotStyle}
								activeDotStyle={[
									styles.carouselActiveDotStyle,
									{
										backgroundColor: Colors.primaryBg || Colors.secondary,
									},
								]}
							>
								{bannerList.map((item: any, index: number) => (
									<Image
										key={`banner-${index.toString()}`}
										source={item}
										style={styles.banner}
										resizeMode="cover"
									/>
								))}
							</Carousel>
						</View>

						{props.route.params.shopName === "Happy Shop" ? (
							<Image
								resizeMode="cover"
								source={require("../../assets/images/Happy-shop.png")}
								style={styles.thumbnail}
							/>
						) : (
							<Image
								resizeMode="cover"
								source={require("../../assets/images/Air-Acres-Shop.png")}
								style={styles.thumbnail}
							/>
						)}

						<View style={{ width: "100%", paddingHorizontal: 8 }}>
							<Text
								style={[styles.prevModalTitle, { fontSize: 18, marginTop: 10 }]}
							>
								{props.route.params.shopName}
							</Text>

							<View
								style={{
									alignItems: "center",
									justifyContent: "center",
									marginTop: 10,
								}}
							>
								<Text style={styles.descText}>
									{`${airportName} (${airportIATACode})`}
								</Text>
								<Text style={styles.descText}>{"Terminal 2, Gate 4"}</Text>
							</View>

							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginVertical: 15,
								}}
							>
								{shopProducts.map((item: any, index: number) => {
									return (
										<Card
											style={styles.itemContainer}
											key={`category-${index}`}
											onPress={() => goToProductSection(item)}
										>
											<>
												<Image
													source={item.image}
													resizeMode="cover"
													style={{ height: 60, width: 60 }}
												/>
												<Text style={[styles.boldText, { marginTop: 5 }]}>
													{item.name}
												</Text>
											</>
										</Card>
									);
								})}
							</View>
						</View>
					</View>
				</ScrollView>
			</WhiteContainer>
		</Container>
	);
};

export default DutyFreeShopDetails;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	carouselDotStyle: {
		backgroundColor: Colors.white,
		height: 3,
		width: 20,
		borderRadius: 10,
		margin: 3,
	},
	carouselActiveDotStyle: {
		backgroundColor: Colors.white,
		height: 3,
		width: 20,
		borderRadius: 10,
		margin: 3,
	},
	banner: {
		height: 200,
	},
	thumbnail: {
		width: 80,
		height: 80,
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
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	itemContainer: {
		margin: 8,
		height: 150,
		width: Math.floor((Constant.WINDOW_WIDTH - 48) / 2),
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
	},
	boldText: {
		fontSize: 15,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 22,
	},
});
