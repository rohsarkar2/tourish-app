import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import Colors from "../configs/Colors";

const styles = StyleSheet.create({
	listFooter: {
		width: "100%",
		height: 120,
		alignItems: "center",
		justifyContent: "flex-start",
		marginTop: 10,
	},
	regularFont: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
});

type Props = {
	isListEnd: boolean;
	isLoadMore: boolean;
};

const FlatlistFooter: React.FC<Props> = (props) =>
	props.isListEnd ? null : (
		<View style={styles.listFooter}>
			{props.isLoadMore ? (
				<>
					<ActivityIndicator size="small" color={Colors.primary} />
					<Text style={styles.regularFont}>{"Loading..."}</Text>
				</>
			) : null}
		</View>
	);

export default FlatlistFooter;
