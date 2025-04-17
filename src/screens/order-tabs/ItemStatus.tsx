import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "../../configs/Colors";
import { toUpperCaseWord } from "../../utils/Util";
import moment from "moment";
import OrderStatus from "../../configs/OrderStatus";

type Props = {
	orderHistory: Array<any>;
};

const ItemStatus: React.FC<Props> = (props) => {
	return (
		<ScrollView style={styles.container}>
			<View style={styles.timeline}>
				{props.orderHistory.map((elem: any, index: any) => {
					let isLastElement = index + 1 === props.orderHistory.length;

					return (
						<View style={styles.statusItem} key={index}>
							<View style={styles.statusDot} />
							{!isLastElement && <View style={styles.statusLine} />}
							<View style={styles.statusTextContainer}>
								<Text style={styles.statusText}>
									{toUpperCaseWord(elem.status)}
								</Text>
								<Text style={styles.dateText}>
									{moment(elem.created_on).format("D MMMM YYYY, hh:mm a")}
								</Text>
							</View>
						</View>
					);
				})}

				{props.orderHistory[props.orderHistory.length - 1].status !==
					OrderStatus.CANCELLED &&
					props.orderHistory[props.orderHistory.length - 1].status !==
						OrderStatus.COMPLETED && (
						<View style={styles.statusItem}>
							<View style={styles.pendingDot} />
							<View style={styles.pendingLine} />
							<View style={styles.statusTextContainer}>
								<Text style={styles.pendingText}>Completed</Text>
							</View>
						</View>
					)}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},
	timeline: {
		width: "100%",
		paddingVertical: 15,
		paddingHorizontal: 25,
	},
	statusItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 25,
	},
	statusDot: {
		width: 15,
		height: 15,
		borderRadius: 7.5,
		backgroundColor: Colors.primary,
	},
	statusLine: {
		position: "absolute",
		top: 20,
		left: 7,
		width: 2,
		height: 80,
		backgroundColor: Colors.primary,
	},
	statusTextContainer: {
		marginLeft: 10,
		paddingTop: 15,
	},
	statusText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		textAlign: "left",
	},
	dateText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		opacity: 0.7,
		textAlign: "left",
	},
	pendingDot: {
		width: 15,
		height: 15,
		borderRadius: 7.5,
		backgroundColor: "rgba(60, 156, 225, 0.4)",
		marginTop: 15,
	},
	pendingLine: {
		position: "absolute",
		bottom: 15,
		left: 7,
		width: 2,
		height: 60,
		backgroundColor: "rgba(60, 156, 225, 0.2)",
	},
	pendingText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		opacity: 0.5,
		textAlign: "left",
	},
});

export default ItemStatus;
