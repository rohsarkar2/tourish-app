import React, { useContext, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Image,
	FlatList,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-solid-svg-icons/faMagnifyingGlass";
import { faArrowUpArrowDown } from "@fortawesome/pro-light-svg-icons/faArrowUpArrowDown";
import { faFilter } from "@fortawesome/pro-light-svg-icons/faFilter";
import { faCircleDot } from "@fortawesome/pro-solid-svg-icons/faCircleDot";
import { faCircle } from "@fortawesome/pro-regular-svg-icons/faCircle";
//@ts-ignore
import Counter from "react-native-counters";
import Snackbar from "react-native-snackbar";
import { DutyFreeProductsScreenProps } from "../../navigation/NavigationTypes";
import {
	Card,
	Container,
	Header,
	WhiteContainer,
	Button,
	BottomSheet,
	NoResult,
} from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import CheckBox from "../../components/CheckBox";
import WishlistContext from "../../context/WishlistContext";
import LocalizedText from "../../resources/LocalizedText";

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

const SORT_VALUES = [
	{ label: "Newest First", value: { createdOn: -1 } },
	{ label: "Price - Low to High", value: { "price.value": 1 } },
	{ label: "Price - High to Low", value: { "price.value": -1 } },
];

const DutyFreeProducts: React.FC<DutyFreeProductsScreenProps> = (
	props: DutyFreeProductsScreenProps
): React.ReactElement => {
	const [products, setProducts] = useState<any>(props.route.params.allProducts);
	const [selectedProduct, setSelectedProduct] = useState<string | undefined>(
		props.route.params.name
	);
	const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [quantity, setQuantity] = useState<number>(1);

	const context2 = useContext(WishlistContext);

	const onSearch = (text: string) => {
		setSearchText(text);
	};

	const goToProductDetails = (item: any) => {
		props.navigation.navigate("DutyFreeProductDetails", {
			productItem: item,
			itemId: item._id,
			itemType: item.category,
		});
	};

	const getProducts = () => {
		let filterData = products.filter((element: any) => {
			let productName = element.name.toLowerCase();
			let searchValue = searchText.toLowerCase();
			return productName.includes(searchValue);
		});
		return filterData;
	};

	const openFilterModal = () => {
		setIsFilterModalOpen(true);
	};

	const closeFilterModal = () => {
		setIsFilterModalOpen(false);
	};

	const onChangeTab = (index: number) => {
		setSelectedTabIndex(index);
	};

	const openSortModal = () => {
		setIsSortModalOpen(true);
	};

	const closeSortModal = () => {
		setIsSortModalOpen(false);
	};

	const handleScroll = (item: any) => {
		setProducts([]);
		setSelectedProduct(item.name);
		const filteredData: any = shopProducts.find(
			(elem: any) => elem.name === item.name
		);
		setProducts(filteredData.products);
	};

	const onSelectItem = (item: any) => {};

	const onClearFilter = () => {};

	const onApplyFilter = () => {};

	// const onAddtoWishlist = (item: any) => {
	// 	let wishlistBody = {
	// 		_id: item._id,
	// 		name: item.name,
	// 		price: item.price,
	// 		type: item.type,
	// 		quantity: quantity,
	// 		image: item.img,
	// 		category: item.category,
	// 		currencyCode: item.currencyCode,
	// 	};
	// 	setTimeout(() => {
	// 		Snackbar.show({
	// 			text: "Item added to your Wishlist.",
	// 			duration: Snackbar.LENGTH_LONG,
	// 			action: {
	// 				text: "View",
	// 				textColor: Colors.secondary,
	// 				onPress: gotoWishlist,
	// 			},
	// 		});
	// 	}, 350);
	// 	context2.addToWishlist(wishlistBody);
	// };

	const gotoWishlist = () => {
		props.navigation.navigate("Wishlist");
	};

	const onChangeQuantity = (value: number, type: any) => {
		setQuantity(value);
	};

	const renderItem = ({ item }: any) => (
		<Card
			style={[styles.itemContainer]}
			// key={index}
			onPress={() => goToProductDetails(item)}
		>
			<>
				<Image
					source={{ uri: item.img }}
					resizeMode="cover"
					style={{
						height: 100,
						width: 100,
						marginTop: 10,
					}}
				/>
				<View style={styles.discount}>
					<Text style={styles.discountTxt}>{`${item.discount}% off`}</Text>
				</View>
				<Text style={[styles.boldText, { marginTop: 5 }]}>{item.name}</Text>
				<Text style={styles.descText}>{item.type}</Text>
				<Text style={styles.descText}>{item.origin}</Text>

				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						marginTop: 5,
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
						{`${item.currencyCode} ${item.oldPrice}`}
					</Text>
					<Text style={[styles.boldText, { marginLeft: 3 }]}>
						{`${item.currencyCode} ${item.price}`}
					</Text>
				</View>
			</>
		</Card>
	);

	const getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			style={{ flex: 0.3, marginTop: 35 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	const keyExtractor = (item: any) => item._id;

	return (
		<Container>
			<Header title={selectedProduct} />
			<WhiteContainer style={{ paddingTop: 0, paddingHorizontal: 0 }}>
				<View
					style={{
						width: "100%",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						backgroundColor: Colors.white,
						borderTopLeftRadius: 30,
						borderTopRightRadius: 30,
					}}
				>
					<TouchableOpacity
						style={[styles.box, { borderTopLeftRadius: 30 }]}
						onPress={openSortModal}
					>
						<Text style={styles.regularText}>{"Sort"}</Text>
						<FontAwesomeIcon
							icon={faArrowUpArrowDown}
							size={16}
							style={{ marginLeft: 5 }}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.box,
							{ borderLeftWidth: 1, borderLeftColor: Colors.lightBorder },
						]}
						onPress={openFilterModal}
					>
						<Text style={styles.regularText}>{"Filter"}</Text>
						<FontAwesomeIcon
							icon={faFilter}
							size={16}
							style={{ marginLeft: 5 }}
						/>
					</TouchableOpacity>
				</View>
				<View style={{ paddingVertical: 10, paddingHorizontal: 8 }}>
					<View style={styles.searchContainer}>
						<View style={styles.searchIcon}>
							<FontAwesomeIcon
								icon={faMagnifyingGlass}
								size={16}
								color={Colors.mediumGrey}
							/>
						</View>
						<TextInput
							autoCapitalize="none"
							placeholder="Search..."
							placeholderTextColor={Colors.mediumGrey}
							style={styles.searchField}
							value={searchText}
							onChangeText={onSearch}
						/>
					</View>

					<View style={{ width: "100%", paddingVertical: 8 }}>
						<ScrollView
							horizontal={true}
							showsHorizontalScrollIndicator={false}
						>
							{shopProducts.map((item: any, index: any) => {
								return (
									<TouchableOpacity
										activeOpacity={0.5}
										key={index}
										style={[
											styles.allProductsBtn,
											selectedProduct === item.name
												? { backgroundColor: Colors.secondary }
												: {
														backgroundColor: Colors.white,
														borderWidth: 1,
														borderColor: Colors.secondary,
												  },
										]}
										onPress={() => handleScroll(item)}
									>
										<Text
											style={[
												styles.allProductsBtnText,
												selectedProduct === item.name
													? { color: Colors.white }
													: { color: Colors.secondary },
											]}
										>
											{item.name}
										</Text>
									</TouchableOpacity>
								);
							})}
						</ScrollView>
					</View>
				</View>
				<FlatList
					keyboardShouldPersistTaps="handled"
					data={getProducts()}
					renderItem={renderItem}
					numColumns={2}
					ListEmptyComponent={getListEmptyComponent}
					showsVerticalScrollIndicator={false}
					keyExtractor={keyExtractor}
				/>
			</WhiteContainer>

			<BottomSheet
				isVisible={isFilterModalOpen}
				title={"Filter"}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.75) }}
				onClose={closeFilterModal}
			>
				<View
					style={{
						flex: 1,
						width: "100%",
						flexDirection: "row",
						borderTopWidth: 1,
						borderTopColor: Colors.lightBorder,
					}}
				>
					<View
						style={{
							width: "35%",
							height: "100%",
							backgroundColor: "#f2f2f2",
						}}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							{[
								"Whisky",
								"Rum",
								"Wine",
								"White Spirits",
								"Liqueur",
								"Aperitifs & Digestifs",
								"Cognac & Body",
								"Champagne",
							].map((item: string, index: number) => (
								<TouchableOpacity
									key={`tab-${item}`}
									onPress={() => onChangeTab(index)}
									style={[
										styles.tab,
										selectedTabIndex === index ? styles.activeTab : null,
									]}
								>
									<Text
										style={[
											styles.regularText,
											selectedTabIndex === index
												? { color: Colors.secondary }
												: null,
										]}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{item}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
					<View
						style={{
							width: "65%",
							height: "100%",
							backgroundColor: Colors.white,
						}}
					>
						{selectedTabIndex === 0 ? (
							<View style={{ flex: 1, width: "100%", padding: 15 }}>
								<ScrollView showsVerticalScrollIndicator={false}>
									{[
										"Singel Malt Whiskey",
										"Scotch Premium",
										"Scotch Standard",
										"Irish Whiskey",
										"Blended Whiskey",
									].map((item: any, index: number) => (
										<CheckBox
											key={`city-${index}`}
											size={14}
											isChecked={item.isChecked}
											title={item}
											onPress={() => onSelectItem(item)}
											style={{ marginBottom: 5 }}
										/>
									))}
								</ScrollView>
							</View>
						) : null}
					</View>
				</View>
				<View style={styles.footer}>
					<Button
						title={"Clear"}
						titleStyle={{ color: Colors.primaryBtn }}
						style={{ height: 35, width: 110, backgroundColor: Colors.white }}
						onPress={onClearFilter}
					/>
					<Button
						title={"Apply"}
						style={{ height: 35, width: 110 }}
						onPress={onApplyFilter}
					/>
				</View>
			</BottomSheet>

			<BottomSheet
				isVisible={isSortModalOpen}
				title={"Sort"}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.4) }}
				onClose={closeSortModal}
			>
				<View
					style={{
						flex: 1,
						width: "100%",
						padding: 15,
						borderTopWidth: 1,
						borderTopColor: Colors.lightBorder,
					}}
				>
					{SORT_VALUES.map((item: any) => {
						// const isChecked: boolean = isEqual(
						// 	item.value
						// 	this.props.selectedSortValue
						// );
						const isChecked: boolean = false;
						return (
							<TouchableOpacity
								key={item.label}
								activeOpacity={1}
								style={{
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "space-between",
									paddingVertical: 10,
								}}
								// onPress={this.onSelectSortItem.bind(this, item.value)}
							>
								<Text style={styles.regularText}>{item.label}</Text>
								<FontAwesomeIcon
									size={16}
									icon={isChecked ? faCircleDot : faCircle}
									color={isChecked ? Colors.primaryBtn : Colors.primaryFont}
								/>
							</TouchableOpacity>
						);
					})}
				</View>
			</BottomSheet>
		</Container>
	);
};

export default DutyFreeProducts;

const styles = StyleSheet.create({
	box: {
		flex: 1,
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		padding: 5,
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
	searchContainer: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 90,
		paddingHorizontal: 5,
		marginVertical: 8,
	},
	searchIcon: {
		width: "8%",
		alignItems: "center",
		justifyContent: "center",
	},
	searchField: {
		height: 38,
		width: "82%",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	bannerImageBox: {
		width: Math.floor(Constant.WINDOW_WIDTH),
		height: 200,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.lightGrey,
		borderRadius: 4,
		marginRight: 10,
	},
	allProductsBtn: {
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		height: 35,
		width: "auto",
		paddingHorizontal: 15,
		marginHorizontal: 4,
	},
	allProductsBtnText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
	},
	itemContainer: {
		padding: 15,
		borderRadius: 10,
		margin: 14,
		width: Math.floor((Constant.WINDOW_WIDTH - 56) / 2),
		// height: 245,
		minHeight: 220,
		alignItems: "center",
	},
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	addToWishlistBtn: {
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		height: 30,
		width: "auto",
		paddingHorizontal: 15,
		backgroundColor: Colors.primaryBtn,
		borderColor: Colors.primaryBtn,
		marginTop: 10,
		marginHorizontal: 2,
	},
	addToWishlistBtnText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.white,
		lineHeight: 20,
	},
	discount: {
		position: "absolute",
		top: 5,
		right: 5,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		height: 25,
		paddingHorizontal: 8,
		backgroundColor: Colors.secondary,
	},
	discountTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.white,
	},
	tab: {
		height: 40,
		width: "100%",
		paddingHorizontal: 15,
		justifyContent: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	activeTab: {
		paddingLeft: 12,
		borderLeftWidth: 3,
		borderLeftColor: Colors.secondary,
		backgroundColor: Colors.white,
	},
	footer: {
		height: 60,
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 15,
		backgroundColor: Colors.white,
		borderTopWidth: 1,
		borderTopColor: Colors.lightBorder,
	},
	modalRegularText: {
		fontSize: 15,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.9,
	},
});
