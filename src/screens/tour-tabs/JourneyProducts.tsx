import React from "react";
import {
	StyleSheet,
	Text,
	FlatList,
	View,
	TouchableOpacity,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowRotateRight } from "@fortawesome/pro-solid-svg-icons/faArrowRotateRight";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { Card, NoResult, Loader } from "../../components";
import LocalizedText from "../../resources/LocalizedText";
import {
	RootStackParamList,
	BottomTabParamList,
} from "../../navigation/NavigationTypes";
import AppContext from "../../context/AppContext";

type Props = {
	isLoading: boolean;
	journeyID: string;
	products: Array<any>;
	navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	>;
	onRefresh: () => void;
};

type States = {
	isRefreshing: boolean;
};

export default class JourneyProducts extends React.Component<Props, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: Props) {
		super(props);

		this.state = {
			isRefreshing: false,
		};
	}

	gotoTourBookProductDetails = (item: any) => {
		this.props.navigation.navigate("JourneyEsimDetails", {
			productId: item.productId,
			productName: item.productName,
			esimId: item.esimData.esim.id,
		});
	};

	onRefresh = () => {
		this.setState({ isRefreshing: true }, () => {
			this.props.onRefresh();
			setTimeout(() => {
				this.setState({ isRefreshing: false });
			}, 5000);
		});
	};

	renderItem = ({ item }: any) => {
		return (
			<Card
				style={styles.card}
				onPress={this.gotoTourBookProductDetails.bind(this, item)}
			>
				<>
					<View
						style={{
							borderBottomWidth: 1,
							borderStyle: "dotted",
							borderBottomColor: Colors.lightBorder,
							paddingBottom: 2,
						}}
					>
						<Text style={styles.lightText}>{`#${item.orderNumber}`}</Text>
					</View>
					<View
						style={{
							width: "100%",
							minHeight: 40,
							flexDirection: "row",
							paddingTop: 4,
						}}
					>
						<View
							style={{
								width: "75%",
								height: "auto",
							}}
						>
							<Text style={[styles.boldText, { fontSize: 16 }]}>
								{item.productName}
							</Text>
							<Text style={styles.lightText}>{item.countryName}</Text>
						</View>
						<View
							style={{
								width: "25%",
								height: "auto",
							}}
						>
							<View
								style={{ flexDirection: "row", justifyContent: "flex-end" }}
							>
								<Text style={styles.boldText}>{item.selectedPlanSize}</Text>
								<Text style={[styles.lightText, { marginTop: 3 }]}>
									{" GB"}
								</Text>
							</View>
							<Text style={[styles.lightText, { textAlign: "right" }]}>
								{item.selectedPlan}
							</Text>
						</View>
					</View>
				</>
			</Card>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<NoResult
			title={LocalizedText.NO_RESULR_FOUND}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	getListHeaderComponent = () => {
		const { isRefreshing } = this.state;
		return (
			<View
				style={{
					width: "30%",
					alignSelf: "flex-end",
					paddingRight: 20,
					marginBottom: 5,
				}}
			>
				<TouchableOpacity
					style={[styles.refreshBtn, isRefreshing ? { opacity: 0.2 } : null]}
					onPress={this.onRefresh}
					disabled={isRefreshing ? true : false}
				>
					<View style={styles.refreshBtnIcon}>
						<FontAwesomeIcon
							icon={faArrowRotateRight}
							size={14}
							color={Colors.white}
						/>
					</View>
					<Text style={styles.refreshBtnText}>{"Refresh"}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	render = () =>
		this.props.isLoading ? (
			<Loader />
		) : (
			<FlatList
				data={this.props.products}
				renderItem={this.renderItem}
				keyExtractor={this.keyExtractor}
				ListHeaderComponent={this.getListHeaderComponent.bind(this)}
				ListEmptyComponent={this.getListEmptyComponent.bind(this)}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps={"handled"}
				contentContainerStyle={
					this.props.products.length <= 0 ? { flex: 1 } : { paddingTop: 10 }
				}
			/>
		);
}

const styles = StyleSheet.create({
	card: {
		// width: Constant.WINDOW_WIDTH - 30,
		// padding: 12,
		// marginVertical: 10,
		// marginHorizontal: 15,
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.greyBtnBg,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 30,
		marginVertical: 10,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
		lineHeight: 21,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
	refreshBtn: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 25,
		alignItems: "center",
		height: 30,
		width: "auto",
		minWidth: 50,
		paddingHorizontal: 6,
		paddingRight: 10,
		backgroundColor: "rgba(21, 189, 216, 0.2)",
		borderColor: Colors.primaryBg,
	},
	refreshBtnIcon: {
		justifyContent: "center",
		alignItems: "center",
		width: 20,
		height: 20,
		borderRadius: 50,
		marginRight: 5,
		backgroundColor: Colors.primaryBg,
	},
	refreshBtnText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: Colors.primaryFont,
		opacity: 0.6,
	},
});
