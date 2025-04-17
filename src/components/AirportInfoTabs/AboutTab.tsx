import React, { Component } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import HTMLView from "react-native-htmlview";
import Colors from "../../configs/Colors";

const tagsStyles = StyleSheet.create({
	p: {
		fontSize: 12,
		lineHeight: 18,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		textAlign: "justify",
		marginBottom: 0,
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
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		margin: 0,
	},
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		paddingHorizontal: 10,
	},
});

type Props = {
	data: string;
};

export default class AboutTab extends Component<Props> {
	render = () => {
		return (
			<View style={styles.container}>
				<ScrollView showsVerticalScrollIndicator={false}>
					{/* @ts-ignore */}
					<HTMLView
						value={this.props.data.replace(/\r?\n|\r/g, "")}
						stylesheet={tagsStyles}
					/>
				</ScrollView>
			</View>
		);
	};
}
