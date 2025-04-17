import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons/faChevronRight";
import { faSimCard } from "@fortawesome/pro-solid-svg-icons/faSimCard";
import moment from "moment";
import Colors from "../../configs/Colors";
import ProductCategory from "../../configs/ProductCategory";
import { toUpperCaseWord } from "../../utils/Util";

type Props = {
	otherItems: Array<any>;
	orderId: string;
	orderNum: string;
	onItemClick: (orderId: string, orderItemId: string, orderNum: string) => void;
};

const OtherItem: React.FC<Props> = (props) => {
	const onItemClick = (
		orderId: string,
		orderItemId: string,
		orderNum: string
	) => {
		if (
			typeof props.onItemClick !== "undefined" &&
			typeof props.onItemClick === "function"
		) {
			props.onItemClick(orderId, orderItemId, orderNum);
		}
	};
	return (
		<View style={styles.container}>
			{props.otherItems.map((item: any, index: number) => {
				let isLastElement = index + 1 === props.otherItems.length;
				return (
					<TouchableOpacity
						style={{
							marginTop: 5,
							paddingHorizontal: 15,
							width: "100%",
							backgroundColor: Colors.white,
						}}
						key={index}
						onPress={() => onItemClick(props.orderId, item._id, props.orderNum)}
					>
						<View style={styles.item}>
							{item.product.thumbnail !== null && (
								<Image
									style={{ height: 50, width: 50 }}
									source={{ uri: item.product.thumbnail }}
								/>
							)}
							{item.product.thumbnail === null &&
								item.product.category === ProductCategory.E_SIM && (
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
									<Text style={[styles.subTitle, { marginTop: 0 }]}>
										{toUpperCaseWord(
											item.product.category.toLowerCase().replace(/_/g, " ")
										)}
									</Text>
									{item.product.subCategory !== null ? (
										<Text style={[styles.subTitle, { marginTop: 0 }]}>
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
										{moment.utc(item.bookingDateTime).format("D MMMM, YYYY") +
											" " +
											moment.utc(item.startTime, "HH:mm:ss").format("HH:mm")}
									</Text>
								) : item.product.category === ProductCategory.CAR_RENTAL ? (
									<Text style={styles.subTitleText}>
										{moment
											.utc(item.bookingDateTime)
											.format("D MMMM, YYYY HH:mm")}
									</Text>
								) : null}
							</View>
							<View style={{}}>
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
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
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

export default OtherItem;
