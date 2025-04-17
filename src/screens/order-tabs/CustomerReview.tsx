import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import Colors from "../../configs/Colors";

const CustomerReview = () => {
	return (
		<View style={styles.container}>
			<View
				style={{
					paddingHorizontal: 15,
					paddingVertical: 10,
					width: "100%",
					height: "auto",
					minHeight: 120,
					justifyContent: "center",
					backgroundColor: Colors.white,
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<FontAwesomeIcon icon={faMagnifyingGlass} size={18} />
					<Text
						style={{
							fontFamily: "Roboto-Regular",
							fontWeight: "400",
							fontSize: 18,
							color: Colors.lightFont,
							marginLeft: 5,
						}}
					>
						{"No reviews found."}
					</Text>
				</View>
			</View>
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

export default CustomerReview;
