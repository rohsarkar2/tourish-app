import React, { useContext, useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	Image,
	TouchableOpacity,
	Alert,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
// import { faStar as faStarFill } from "@fortawesome/pro-solid-svg-icons/faStar";
// import { faStar as faStarEmpty } from "@fortawesome/pro-regular-svg-icons/faStar";
// import { faStarHalfStroke } from "@fortawesome/pro-regular-svg-icons/faStarHalfStroke";
import { faSquare } from "@fortawesome/pro-solid-svg-icons/faSquare";
import { faCircleInfo } from "@fortawesome/pro-regular-svg-icons/faCircleInfo";
import moment from "moment-timezone";
import { PorterScreenProps } from "../../navigation/NavigationTypes";
import Colors from "../../configs/Colors";
import Carousel from "pinar";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	Loader,
	BottomSheet,
} from "../../components";
import { toUpperCaseWord } from "../../utils/Util";
import ProductService from "../../services/ProductService";
import AppContext from "../../context/AppContext";
import LocalizedText from "../../resources/LocalizedText";
import Constant from "../../configs/Constant";
import ProgressiveImage from "../../components/ProgressiveImage";

const styles = StyleSheet.create({
	prevModalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	initilaContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 5,
		backgroundColor: Colors.white,
	},
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
	prevModalCoverCurve: {
		position: "absolute",
		bottom: 0,
		height: 50,
		width: "100%",
		backgroundColor: Colors.white,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
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
	mediumTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 21,
		color: Colors.secondaryFont,
	},
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	amenitiesView: {
		height: 60,
		width: 70,
		marginHorizontal: 10,
		marginVertical: 10,
		alignItems: "flex-end",
		padding: 5,
	},
	amenitiesImg: {
		height: 30,
		width: 30,
		alignSelf: "center",
	},
	amenitiesTxt: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.7,
		alignSelf: "center",
		fontSize: 10,
	},
	modalBody: {
		padding: 20,
	},
	modalBodyHeader: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 30,
		color: Colors.secondaryFont,
	},
	chargesRow: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	otherChargesTableHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	otherChargesTableBody: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 5,
		alignItems: "center",
	},
	otherChargesTableHeaderData: {
		fontFamily: "Roboto-Regular",
		fontWeight: "bold",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	otherChargesTableBodyData: {
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	otherChargesData: {
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
		marginLeft: 5,
		marginTop: 1,
	},
	boldFont: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 1,
	},
});

const Porter: React.FC<PorterScreenProps> = (
	props: PorterScreenProps
): React.ReactElement => {
	const context = useContext(AppContext);
	const productId: string = props.route.params.productId;
	const currencyCode: string = context.userData?.currency.code as string;

	const [isImageViewOpen, setIsImageViewOpen] = useState<boolean>(false);
	const [productDetails, setProductDetails] = useState<any>(null);
	const [banners, setBanners] = useState<Array<any>>([]);
	const [reversedCancellationCharges, setReversedCancellationCharges] =
		useState<Array<any>>([]);
	const [localDateTime, setLocalDateTime] = useState<null | string>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isRefundableModalOpen, setIsRefundableModalOpen] =
		useState<boolean>(false);

	useEffect(() => {
		ProductService.getDetails(productId, currencyCode)
			.then((response) => {
				const resData: any = response.data;
				const bannersArr: Array<any> = (resData.bannersUrl || []).map(
					(item: string) => ({
						uri: item,
					})
				);

				setLocalDateTime(
					moment().tz(resData.timeZone).format("DD/MM/YYYY, HH:mm:ss")
				);
				setProductDetails(resData);

				setReversedCancellationCharges(
					resData.othersCancellationCharges.reverse()
				);
				setBanners(bannersArr);
				setIsLoading(false);
			})
			.catch((error) => {
				setIsLoading(false);
			});
	}, []);

	// const getStarContent = (rating: string) => {
	// 	let content = [];
	// 	let numberPart = Math.trunc(parseFloat(rating));
	// 	let decimalPart = parseFloat(rating) - numberPart;

	// 	for (let i = 0; i < numberPart; i++) {
	// 		content.push(
	// 			<FontAwesomeIcon
	// 				key={`star-fill-${i}`}
	// 				icon={faStarFill}
	// 				size={10}
	// 				color={Colors.secondary}
	// 			/>
	// 		);
	// 	}

	// 	numberPart = decimalPart > 0 ? numberPart + 1 : numberPart;
	// 	let remainingPart = Constant.MAX_RATING_VALE - numberPart;

	// 	if (decimalPart > 0) {
	// 		content.push(
	// 			<FontAwesomeIcon
	// 				key={"star-half-1"}
	// 				icon={faStarHalfStroke}
	// 				size={10}
	// 				color={Colors.secondary}
	// 			/>
	// 		);
	// 	}

	// 	for (let i = 0; i < remainingPart; i++) {
	// 		content.push(
	// 			<FontAwesomeIcon
	// 				key={`star-empty-${i}`}
	// 				icon={faStarEmpty}
	// 				size={10}
	// 				color={Colors.secondary}
	// 			/>
	// 		);
	// 	}
	// 	return content;
	// };

	const closeImageView = () => {
		setIsImageViewOpen(false);
	};

	const onContinue = () => {
		const { userData } = context;
		if (userData !== null) {
			props.navigation.navigate("TimeSlots", {
				productId: productDetails._id,
				productName: productDetails.name,
				startDate: moment
					.utc(productDetails.service_start_date)
					.format("YYYY-MM-DD"),
				endtDate: moment
					.utc(productDetails.service_end_date)
					.format("YYYY-MM-DD"),
				sellEndDate: moment
					.utc(productDetails.sell_end_date)
					.format("YYYY-MM-DD"),
				sellEndTime: productDetails.sell_end_time,
				minimumBookingHour: productDetails.minBookingHour,
			});
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const openRefundableModal = () => {
		setIsRefundableModalOpen(true);
	};

	const closeRefundableModal = () => {
		setIsRefundableModalOpen(false);
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
					<ScrollView showsVerticalScrollIndicator={false}>
						<View style={styles.container}>
							{typeof productDetails.bannersUrl !== "undefined" ? (
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
							<Image
								resizeMode="cover"
								source={{ uri: productDetails.thumbnailUrl }}
								style={styles.thumbnail}
							/>
							<View style={{ width: "100%", paddingHorizontal: 15 }}>
								<Text
									style={[
										styles.prevModalTitle,
										{ fontSize: 18, marginTop: 20 },
									]}
								>
									{productDetails.name}
								</Text>

								{/* <View
									style={{
										flexDirection: "row",
										justifyContent: "center",
										marginBottom: 10,
									}}
								>
									<Text>
										{getStarContent(parseInt(productDetails.rating))}
										<Text> {`(${productDetails.total_review})`}</Text>
									</Text>
								</View> */}

								{/* <Text
									style={[
										styles.prevModalTitle,
										{ fontSize: 20, lineHeight: 20, marginTop: 10 },
									]}
								>
									{`${productDetails.price.code} ${productDetails.price.value}`}
								</Text> */}

								<View
									style={{
										flexDirection: "row",
										justifyContent: "center",
										alignItems: "center",
										marginTop: 10,
									}}
								>
									<Text
										style={[
											styles.boldFont,
											{ color: Colors.primaryBtn, fontSize: 14, marginTop: 3 },
										]}
									>
										{productDetails.price.code}
									</Text>
									<Text style={[styles.boldFont, { fontSize: 20 }]}>
										{` ${Number(productDetails.price.value).toFixed(2)}`}
									</Text>
								</View>

								<Text
									style={[
										styles.prevModalTitle,
										{ textAlign: "center", marginTop: 15 },
									]}
								>
									{LocalizedText.LANGUAGES}
								</Text>

								<View
									style={{
										flex: 1,
										alignItems: "center",
									}}
								>
									<Text style={styles.descText}>
										{productDetails.languages
											.map((item: any) => item.name)
											.join(", ")}
									</Text>
								</View>

								<View
									style={{
										alignItems: "center",
										justifyContent: "center",
										marginTop: 10,
									}}
								>
									<Text style={[styles.prevModalTitle]}>
										{LocalizedText.LOCATION}
									</Text>
									<Text style={styles.descText}>
										{`${productDetails.airport.name} (${productDetails.airport.iata_code})`}
									</Text>
									<Text style={styles.descText}>
										{`${productDetails.city.name}, ${productDetails.state.name}, ${productDetails.country.name}`}
									</Text>
								</View>

								<Text style={[styles.prevModalTitle, { marginTop: 10 }]}>
									{toUpperCaseWord(
										productDetails.category.toLowerCase().replaceAll("_", " ")
									)}
								</Text>

								<Text
									style={[
										styles.descText,
										{ textAlign: "center", marginVertical: 5 },
									]}
								>
									{productDetails.description}
								</Text>

								<Text style={[styles.prevModalTitle, { marginTop: 10 }]}>
									{LocalizedText.VENDOR}
								</Text>

								<Text
									style={[
										styles.descText,
										{ textAlign: "center", fontSize: 14 },
									]}
								>
									{productDetails.seller.name}
								</Text>

								<Text style={[styles.prevModalTitle, { marginTop: 15 }]}>
									{"Refundable"}
								</Text>
								{productDetails.isRefundable ? (
									<>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<Text
												style={[
													styles.descText,
													{ textAlign: "center", fontSize: 14 },
												]}
											>
												{"Cancellation charges may apply."}
											</Text>
											<TouchableOpacity onPress={openRefundableModal}>
												<FontAwesomeIcon
													icon={faCircleInfo}
													size={14}
													style={{
														marginTop: 3,
														marginLeft: 5,
														color: Colors.primary,
													}}
												/>
											</TouchableOpacity>
										</View>
									</>
								) : (
									<Text
										style={{
											fontFamily: "Roboto-Medium",
											fontWeight: "500",
											fontSize: 14,
											lineHeight: 18,
											opacity: 0.8,
											textAlign: "center",
											color: Colors.danger,
										}}
									>
										{"NO"}
									</Text>
								)}

								<Button
									title={LocalizedText.CONTINUE}
									style={{ marginVertical: 25 }}
									onPress={onContinue}
								/>
							</View>
						</View>
					</ScrollView>
				)}
			</WhiteContainer>

			<BottomSheet
				isVisible={isRefundableModalOpen}
				title={"Cancellation Charges"}
				style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
				onClose={closeRefundableModal}
			>
				<View style={styles.modalBody}>
					<View style={{ flexDirection: "row" }}>
						<Text style={[styles.modalBodyHeader, { marginRight: 5 }]}>
							{"Minimum Cancellation Charge   - "}
						</Text>
						<View>
							<Text style={[styles.modalBodyHeader]}>
								{`${productDetails?.defaultCancellationCharge}%`}
							</Text>
						</View>
					</View>

					<Text
						style={[
							styles.modalBodyHeader,
							{
								marginTop: 15,
								marginBottom: 5,
							},
						]}
					>
						{"Other Cancellation Charges"}
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginBottom: 8,
						}}
					>
						<FontAwesomeIcon
							icon={faSquare}
							size={8}
							color={Colors.mediumGrey}
						/>
						<Text
							style={[styles.otherChargesData]}
						>{`Before ${reversedCancellationCharges[0]?.max_hour}  Hrs  -  ${productDetails?.defaultCancellationCharge}%`}</Text>
					</View>

					{reversedCancellationCharges.map((item: any, index: any) => {
						return (
							<View
								key={`charge-${index}`}
								style={{
									flexDirection: "row",
									alignItems: "center",
									marginBottom: 8,
								}}
							>
								<FontAwesomeIcon
									icon={faSquare}
									size={8}
									color={Colors.mediumGrey}
								/>
								<Text
									style={[styles.otherChargesData]}
								>{`Between ${item.min_hour} and ${item.max_hour} Hrs  -  ${item.percentage}%`}</Text>
							</View>
						);
					})}
				</View>
			</BottomSheet>

			{banners.length > 0 && (
				<ImageView
					images={banners}
					imageIndex={0}
					visible={isImageViewOpen}
					onRequestClose={closeImageView}
				/>
			)}
		</Container>
	);
};

export default Porter;
