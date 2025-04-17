import React from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Colors from "../configs/Colors";

type Props = {
	isLoadMore: boolean;
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		height: 120,
		alignItems: "center",
		justifyContent: "flex-start",
		backgroundColor: "transparent",
		marginTop: 10,
	},
	loadingText: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		fontSize: 12,
	},
});

const ListFooter: React.FC<Props> = (props) => (
	<View style={styles.container}>
		{props.isLoadMore ? (
			<>
				<ActivityIndicator size="small" color={Colors.primary} />
				<Text style={styles.loadingText}>{"Loading..."}</Text>
			</>
		) : null}
	</View>
);

export default ListFooter;
