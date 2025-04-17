import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	Image,
} from "react-native";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";

type Props = {
	productCategories: Array<any>;
	onPressProductCategory: (item: any) => void;
};

export default class ForYouTab extends React.Component<Props> {
	onPressCategory = (item: any) => {
		this.props.onPressProductCategory(item);
	};

	render = (): React.ReactNode => (
		<View style={styles.container}>
			{this.props.productCategories.map((item: any) => (
				<View key={item.category} style={styles.categoryBox}>
					<TouchableHighlight
						underlayColor={Colors.secondaryAlpha2}
						onPress={this.onPressCategory.bind(this, item)}
						style={styles.categoryIcon}
					>
						<Image
							source={{ uri: item.icon }}
							style={{ width: 35, height: 35 }}
							resizeMode="cover"
						/>
					</TouchableHighlight>
					<Text style={styles.categoryText}>{item.name}</Text>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "flex-start",
		paddingVertical: 10,
	},
	categoryBox: {
		width: Math.floor(Constant.WINDOW_WIDTH / 3),
		alignItems: "center",
		paddingHorizontal: 10,
		marginVertical: 10,
	},
	categoryIcon: {
		width: 55,
		height: 55,
		borderRadius: 100,
		borderColor: Colors.secondaryAlpha1,
		backgroundColor: Colors.secondaryAlpha1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 5,
	},
	categoryText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		textAlign: "center",
	},
});
