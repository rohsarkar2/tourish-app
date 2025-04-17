import React, { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Carousel from "pinar";
import HTMLView from "react-native-htmlview";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSquare } from "@fortawesome/pro-solid-svg-icons/faSquare";
import { faTemperatureHigh } from "@fortawesome/pro-light-svg-icons/faTemperatureHigh";
import { faRaindrops } from "@fortawesome/pro-light-svg-icons/faRaindrops";
import { faSun } from "@fortawesome/pro-light-svg-icons/faSun";
import { LowSeasonDestinationScreenProps } from "../../navigation/NavigationTypes";
import {
	Container,
	Header,
	Loader,
	WhiteContainer,
	Accordion,
	Card,
	Button,
} from "../../components";
import AppContext, { SearchItem } from "../../context/AppContext";
import ProductService from "../../services/ProductService";
import Constant from "../../configs/Constant";
import Colors from "../../configs/Colors";
import ProductScope from "../../configs/ProductScope";
import ProgressiveImage from "../../components/ProgressiveImage";

const tagsStyles: any = StyleSheet.create({
	h1: {
		fontSize: 18,
		lineHeight: 27,
		color: Colors.primaryFont,
		marginBottom: 5,
	},
	h2: {
		fontSize: 16,
		lineHeight: 24,
		color: Colors.primaryFont,
		marginBottom: 5,
	},
	h3: {
		fontSize: 14,
		lineHeight: 21,
		color: Colors.primaryFont,
		marginBottom: 5,
	},
	p: {
		fontSize: 14,
		lineHeight: 21,
		color: Colors.primaryFont,
		marginVertical: 0,
	},
	strong: {
		color: "#000000",
	},
	ul: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.primaryFont,
		marginVertical: 0,
	},
	ol: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.primaryFont,
		marginVertical: 0,
	},
	li: {
		fontSize: 12,
		lineHeight: 18,
		color: Colors.primaryFont,
	},
});

const Li: React.FC<{ text: string }> = (props) => {
	return (
		<View
			style={{
				flexDirection: "row",
				marginBottom: 3,
				marginVertical: 15,
				paddingRight: 8,
			}}
		>
			<FontAwesomeIcon
				icon={faSquare}
				size={8}
				color={Colors.mediumGrey}
				style={{ marginTop: 6, marginRight: 8 }}
			/>
			<Text
				style={{
					fontSize: 14,
					fontFamily: "Roboto-Regular",
					fontWeight: "400",
					color: Colors.primaryFont,
					lineHeight: 21,
				}}
			>
				{props.text}
			</Text>
		</View>
	);
};

const LowSeasonDestination: React.FC<LowSeasonDestinationScreenProps> = (
	props: LowSeasonDestinationScreenProps
): React.ReactElement => {
	const context = useContext(AppContext);
	const [productDetails, setProductDetails] = useState<null | any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [accordianData, setAccordianData] = useState<Array<any>>([]);

	useEffect(() => {
		const productId = props.route.params.productId;
		ProductService.getLowSeasonDetails(productId)
			.then((response) => {
				const resData: any = response.data;
				let data: Array<any> = [];

				if (resData.insiderTip !== null) {
					data.push({
						title: "Insider Tips",
						content: (resData.insiderTip !== null
							? resData.insiderTip
							: []
						).map((item: string, index: number) => (
							<Li key={`insiderTip-${index}`} text={item} />
						)),
					});
				}
				if (resData.goodToKnow !== null) {
					data.push({
						title: "Good To Know",
						content: (resData.goodToKnow !== null
							? resData.goodToKnow
							: []
						).map((item: string, index: number) => (
							<Li key={`goodToKnow-${index}`} text={item} />
						)),
					});
				}
				setAccordianData(data);
				setProductDetails(resData);
				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
			});
	}, []);

	const onExplore = () => {
		const item: SearchItem = {
			country: productDetails.country.name,
			name:
				productDetails.scope === ProductScope.COUNTRY
					? productDetails.country.name
					: productDetails.scope === ProductScope.PROVINCE
					? productDetails.state.name
					: productDetails.city.name,
			type:
				productDetails.scope === ProductScope.COUNTRY
					? Constant.SEARCH_ITEM_TYPE_COUNTRY
					: productDetails.scope === ProductScope.PROVINCE
					? Constant.SEARCH_ITEM_TYPE_PROVINCE
					: Constant.SEARCH_ITEM_TYPE_CITY,
			sourceId:
				productDetails.scope === ProductScope.COUNTRY
					? productDetails.country._id
					: productDetails.scope === ProductScope.PROVINCE
					? productDetails.state._id
					: productDetails.city._id,
		};

		const { searchData } = context;
		const data: Array<SearchItem> = [...searchData];
		data.push(item);
		context.setSearchData(data);

		props.navigation.navigate("Explore");
	};

	return (
		<Container>
			<Header title={props.route.params.productName} />
			<WhiteContainer
				style={{
					paddingTop: 0,
					paddingHorizontal: 0,
					borderTopLeftRadius: 0,
					borderTopRightRadius: 0,
				}}
			>
				{isLoading ? (
					<Loader />
				) : (
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={[styles.container]}>
							{productDetails.bannersUrl !== null ? (
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
												backgroundColor:
													productDetails.primary_color || Colors.secondary,
											},
										]}
									>
										{productDetails.bannersUrl.map(
											(item: any, index: number) => (
												// <Image
												// 	key={`banner-${index.toString()}`}
												// 	source={{
												// 		uri: item,
												// 	}}
												// 	style={styles.banner}
												// 	resizeMode="cover"
												// />
												<ProgressiveImage
													key={`banner-${index.toString()}`}
													source={{ uri: item }}
												/>
											)
										)}
									</Carousel>
								</View>
							) : null}

							<View
								style={{
									width: "100%",
									paddingHorizontal: 6,
									paddingVertical: 10,
								}}
							>
								<View style={{ paddingHorizontal: 12 }}>
									{productDetails.scope === "COUNTRY" ? (
										<Text style={[styles.locationTxt]}>
											{productDetails.country.name}
										</Text>
									) : productDetails.scope === "PROVINCE" ? (
										<View
											style={{ flexDirection: "row", alignItems: "center" }}
										>
											<Text
												style={[styles.locationTxt]}
											>{`${productDetails.state.name}`}</Text>
											<Text
												style={{
													fontFamily: "Roboto-Regular",
													fontWeight: "400",
													color: Colors.primaryBg,
													fontSize: 14,
													marginTop: 10,
												}}
											>{`, ${productDetails.country.name}`}</Text>
										</View>
									) : productDetails.scope === "CITY" ? (
										<View
											style={{ flexDirection: "row", alignItems: "center" }}
										>
											<Text
												style={[styles.locationTxt]}
											>{`${productDetails.city.name}`}</Text>
											<Text
												style={{
													fontFamily: "Roboto-Regular",
													fontWeight: "400",
													color: Colors.primaryBg,
													fontSize: 14,
													marginTop: 10,
												}}
											>{`  ${productDetails.state.name}, ${productDetails.country.name}`}</Text>
										</View>
									) : null}

									<Text style={styles.tagLineText}>
										{productDetails.tagLine}
									</Text>
								</View>

								<View
									style={{
										padding: 12,
									}}
								>
									<Text style={styles.aboutTxt}>{"About:"}</Text>
									{/* @ts-ignore */}
									<HTMLView
										value={productDetails.description.replace(/\r?\n|\r/g, "")}
										stylesheet={tagsStyles}
									/>
								</View>

								<View
									style={{
										flexDirection: "row",
										flexWrap: "wrap",
										marginVertical: 10,
									}}
								>
									{productDetails.lowSessionMonths.map(
										(item: any, index: any) => {
											return (
												<Card
													style={{
														margin: 6,
														minHeight: 100,
														width: Math.floor((Constant.WINDOW_WIDTH - 48) / 3),
														// alignItems: "center",
														borderRadius: 12,
														padding: 10,
													}}
													key={`card-${index}`}
												>
													<Text
														style={[
															styles.label,
															{ marginBottom: 5, textAlign: "center" },
														]}
													>
														{item.monthsName}
													</Text>
													<View
														style={{
															flexDirection: "row",
															alignItems: "center",
															paddingVertical: 8,
														}}
													>
														<FontAwesomeIcon
															icon={faTemperatureHigh}
															size={18}
															style={{ marginRight: 3 }}
															color={Colors.primaryBg}
														/>
														<Text
															style={[styles.descText, { marginLeft: 3 }]}
														>{`${item.temprature}° C`}</Text>
													</View>

													<View
														style={{
															flexDirection: "row",
															alignItems: "center",
															paddingVertical: 8,
														}}
													>
														<FontAwesomeIcon
															icon={faRaindrops}
															size={20}
															style={{ marginRight: 3 }}
															color={Colors.primaryBg}
														/>
														<Text
															style={[styles.descText, { marginLeft: 3 }]}
														>{`${item.rainfall} mm`}</Text>
													</View>
													<View
														style={{
															flexDirection: "row",
															alignItems: "center",
															paddingVertical: 8,
														}}
													>
														<FontAwesomeIcon
															icon={faSun}
															size={18}
															style={{ marginRight: 3 }}
															color={Colors.primaryBg}
														/>
														<Text
															style={[styles.descText, { marginLeft: 3 }]}
														>{`${item.dayLight} hrs`}</Text>
													</View>
												</Card>
											);
										}
									)}
								</View>

								<View style={{ paddingHorizontal: 6, marginTop: 10 }}>
									<Accordion
										data={
											// 	[
											// {
											// 	title: "Insider Tips",
											// 	content: (productDetails.insiderTip !== null
											// 		? productDetails.insiderTip
											// 		: []
											// 	).map((item: string, index: number) => (
											// 		<Li key={`insiderTip-${index}`} text={item} />
											// 	)),
											// },
											// {
											// 	title: "Good To Know",
											// 	content: (productDetails.goodToKnow !== null
											// 		? productDetails.goodToKnow
											// 		: []
											// 	).map((item: string, index: number) => (
											// 		<Li key={`goodToKnow-${index}`} text={item} />
											// 	)),
											// },
											// 	]
											accordianData
										}
									/>
								</View>

								<View
									style={{
										width: "100%",
										paddingHorizontal: 6,
										marginVertical: 15,
									}}
								>
									<Button title="Explore" onPress={onExplore} />
								</View>
							</View>
						</View>
					</ScrollView>
				)}
			</WhiteContainer>
		</Container>
	);
};

export default LowSeasonDestination;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
	},
	carouselDotStyle: {
		backgroundColor: Colors.white,
		height: 8,
		width: 8,
		borderRadius: 10,
		margin: 3,
	},
	carouselActiveDotStyle: {
		backgroundColor: Colors.white,
		height: 8,
		width: 8,
		borderRadius: 10,
		margin: 3,
	},
	banner: {
		height: 250,
	},
	label: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		// opacity: 0.6,
	},
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	tagLineText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.mediumGrey,
		fontSize: 14,
		textAlign: "justify",
		marginBottom: 15,
		// textTransform: "capitalize",
	},
	aboutTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		fontSize: 18,
		lineHeight: 27,
		marginBottom: 10,
	},
	locationTxt: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryBg,
		fontSize: 25,
	},
});
