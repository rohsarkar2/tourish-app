import React from "react";
import {
	StyleSheet,
	FlatList,
	ActivityIndicator,
	Text,
	View,
	BackHandler,
	Image,
} from "react-native";
import moment from "moment-timezone";
import { CommonActions } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import {
	Card,
	Container,
	Header,
	Loader,
	NoResult,
	WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import { EsimListScreenProps } from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import ProductService from "../services/ProductService";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

type States = {
	page: number;
	esimList: Array<any>;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
};

export default class EsimList extends React.Component<
	EsimListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private backHandler: any;
	private focusListner: any;

	constructor(props: any) {
		super(props);

		this.state = {
			page: 1,
			esimList: [],
			isLoading: true,
			isRefresing: false,
			isLoadMore: false,
			isListEnd: true,
		};
	}

	componentDidMount = () => {
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.gotoBack
		);

		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount = () => {
		this.backHandler.remove();
		this.focusListner();
	};

	onFocusScreen = () => {
		this.setState(
			{
				page: 1,
				esimList: [],
				isLoading: true,
				isRefresing: false,
				isLoadMore: false,
				isListEnd: true,
			},
			() => {
				this.loadData();
			}
		);
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true, page: 1 }, () => {
			this.loadData();
		});
	};

	handelLoadMore = () => {
		this.setState({ isLoadMore: true, page: this.state.page + 1 }, () => {
			this.loadData();
		});
	};

	loadData = () => {
		const { userData } = this.context;
		const reqData = {
			page: this.state.page,
			limit: Constant.DEFAULT_LIMIT,
			customerId: userData?._id,
		};

		ProductService.esimList(reqData)
			.then((response) => {
				const data: Array<any> = response.data;
				const { esimList, isRefresing } = this.state;
				const allEsim: Array<any> =
					isRefresing === true ? [...data] : [...esimList, ...data];

				this.setState({
					esimList: allEsim,
					isListEnd: allEsim.length === Number(response.count),
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
				});
			})
			.catch((error) => {
				this.setState({
					page: 1,
					esimList: [],
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
					isListEnd: true,
				});
			});
	};

	gotoEsimDetails = (item: any) => {
		this.props.navigation.navigate("JourneyEsimDetails", {
			productId: item.product.productId,
			productName: item.product.name,
			esimId: item.eSimId,
		});
	};

	renderItem = ({ item }: any) => {
		return (
			<Card
				style={{
					padding: 10,
					borderWidth: 1,
					borderColor: Colors.greyBtnBg,
					borderRadius: 10,
					alignSelf: "center",
					marginHorizontal: 10,
					width: Constant.WINDOW_WIDTH - 34,
					marginVertical: 7,
				}}
				onPress={this.gotoEsimDetails.bind(this, item)}
			>
				<>
					<View
						style={{
							borderBottomWidth: 1,
							borderStyle: "dotted",
							borderBottomColor: Colors.lightBorder,
							paddingBottom: 5,
						}}
					>
						<Text
							style={{
								fontFamily: "Roboto-Regular",
								fontWeight: "400",
								fontSize: 14,
								color: Colors.primaryFont,
							}}
						>{`#${item.orderNumber}`}</Text>
					</View>
					<View
						style={{
							width: "100%",
							flexDirection: "row",
							borderBottomWidth: 1,
							borderStyle: "dotted",
							borderBottomColor: Colors.lightBorder,
							paddingVertical: 5,
						}}
					>
						<View
							style={{
								width: "75%",
								height: "auto",
							}}
						>
							<View style={{ width: "100%", flexDirection: "row" }}>
								<View style={{ width: "25%" }}>
									<Image
										resizeMode="contain"
										source={{ uri: item.product.thumbnail }}
										style={{
											width: 60,
											height: 60,
											borderRadius: 8,
										}}
									/>
								</View>
								<View style={{ width: "75%", paddingLeft: 8 }}>
									<Text
										style={[styles.titleText, { marginBottom: 2 }]}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{item.product.name}
									</Text>
									<Text
										style={{
											fontFamily: "Roboto-Light",
											fontWeight: "300",
											fontSize: 14,
											color: Colors.primaryFont,
										}}
									>
										{item.plan.countryName}
									</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								width: "25%",
								height: "auto",
								// flexDirection: "row",
								// justifyContent: "flex-end",
								// alignItems: "center",
								// minHeight: 150,
								// borderWidth: 1,
							}}
						>
							{typeof item.orderType !== "undefined" && (
								<Text
									style={{
										fontFamily: "Roboto-Medium",
										fontWeight: "500",
										fontSize: 12,
										color: Colors.secondaryFont,
										alignSelf: "flex-end",
										marginBottom: 4,
									}}
								>
									{item.orderType}
								</Text>
							)}
							<View
								style={{
									flexDirection: "row",
									justifyContent: "flex-end",
									alignItems: "center",
								}}
							>
								<Text
									style={[
										styles.boldFont,
										{ color: Colors.primaryBtn, fontSize: 18 },
									]}
								>
									{item.plan.quotaGB}
								</Text>
								<Text
									style={[styles.regularFont, { marginTop: 4 }]}
								>{` GB`}</Text>
							</View>
						</View>
					</View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							marginTop: 5,
						}}
					>
						<Text
							style={{
								fontFamily: "Roboto-Regular",
								fontWeight: "400",
								fontSize: 12,
								color: Colors.primaryFont,
							}}
						>
							{item.product.sellerName}
						</Text>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginTop: 5,
							}}
						>
							<FontAwesomeIcon
								icon={faClock}
								size={14}
								color={Colors.primaryFont}
								style={{ marginRight: 5 }}
							/>

							<Text
								style={{
									fontFamily: "Roboto-Regular",
									fontWeight: "400",
									fontSize: 12,
									color: Colors.primaryFont,
								}}
							>
								{moment.utc(item.createdOn).format("Do MMMM, YYYY")}
							</Text>
						</View>
					</View>
				</>
			</Card>
		);
	};

	keyExtractor = (item: any) => item.eSimId;

	listEmptyComponent = () => (
		<NoResult
			title={"No Results Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	getListFooterComponent = () =>
		this.state.isListEnd ? null : (
			<View style={styles.listFooter}>
				{this.state.isLoadMore ? (
					<>
						<ActivityIndicator size="small" color={Colors.primary} />
						<Text style={styles.value}>{"Loading..."}</Text>
					</>
				) : null}
			</View>
		);

	gotoBack = () => {
		this.props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: "HomeTab",
						params: { screen: "Account" },
					},
				],
			})
		);
		return true;
	};

	render = () => (
		<Container>
			<Header title={"E-sim"} onBackAction={this.gotoBack} />
			<WhiteContainer style={{ paddingHorizontal: 7, paddingTop: 10 }}>
				{this.state.isLoading ? (
					// <Loader />
					<>
						{[1, 2, 3].map((item) => (
							<View
								key={item.toString()}
								style={[
									styles.skeletonContainer,
									{
										width: Constant.WINDOW_WIDTH - 24,
										marginVertical: 10,
										marginHorizontal: 12,
									},
								]}
							>
								<SkeletonPlaceholder>
									<SkeletonPlaceholder.Item>
										<SkeletonPlaceholder.Item
											width={170}
											height={10}
											borderRadius={3}
											marginBottom={8}
										/>
										<SkeletonPlaceholder.Item
											width={120}
											height={10}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={90}
											height={10}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={150}
											height={10}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={90}
											height={10}
											borderRadius={3}
											marginBottom={8}
										/>
										<SkeletonPlaceholder.Item
											width={150}
											height={10}
											borderRadius={3}
											// marginBottom={6}
										/>
									</SkeletonPlaceholder.Item>
								</SkeletonPlaceholder>
							</View>
						))}
					</>
				) : (
					<FlatList
						data={this.state.esimList}
						renderItem={this.renderItem}
						keyExtractor={this.keyExtractor}
						refreshing={this.state.isRefresing}
						onRefresh={this.handelRefresh}
						showsVerticalScrollIndicator={false}
						onEndReached={
							this.state.isListEnd ? undefined : this.handelLoadMore
						}
						ListFooterComponent={this.getListFooterComponent.bind(this)}
						ListEmptyComponent={this.listEmptyComponent.bind(this)}
						contentContainerStyle={
							this.state.esimList.length <= 0 ? { flex: 1 } : null
						}
					/>
				)}
			</WhiteContainer>
		</Container>
	);
}

const styles = StyleSheet.create({
	itemContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 34,
		marginVertical: 7,
	},
	skeletonContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 10,
		width: "100%",
		alignSelf: "center",
	},
	value: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 13,
		color: Colors.secondaryFont,
		opacity: 0.6,
	},
	listFooter: {
		width: "100%",
		height: 120,
		alignItems: "center",
		justifyContent: "flex-start",
		marginTop: 10,
	},
	boldFont: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 1,
	},
	regularFont: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.primaryFont,
	},
	lightFont: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.primaryFont,
	},
	titleText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: Colors.primaryBg,
	},
});
