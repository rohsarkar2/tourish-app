import React from "react";
import {
	StyleSheet,
	FlatList,
	ActivityIndicator,
	Text,
	View,
	BackHandler,
	Image,
	TextInput,
} from "react-native";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSimCard } from "@fortawesome/pro-solid-svg-icons/faSimCard";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { faXmark } from "@fortawesome/pro-solid-svg-icons/faXmark";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faExclamation } from "@fortawesome/pro-solid-svg-icons/faExclamation";
import { faArrowRotateRight } from "@fortawesome/pro-solid-svg-icons/faArrowRotateRight";
import { faCar } from "@fortawesome/pro-solid-svg-icons/faCar";
import { CommonActions } from "@react-navigation/native";
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
import { MyOrdersScreenProps } from "../navigation/NavigationTypes";
import OrderService from "../services/OrderService";
import AppContext from "../context/AppContext";
import { toUpperCaseWord } from "../utils/Util";
import OrderStatus, {
	OrderStatusBackgroundColor,
	OrderStatusBorderColor,
	OrderStatusIconBackgroundColor,
} from "../configs/OrderStatus";
import ProductCategory from "../configs/ProductCategory";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

type States = {
	page: number;
	orders: Array<any>;
	isLoading: boolean;
	searchValue: string;
	isSearching: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
};

export default class MyOrders extends React.Component<
	MyOrdersScreenProps,
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
			orders: [],
			searchValue: "",
			isSearching: false,
			isLoading: true,
			isRefresing: false,
			isLoadMore: false,
			isListEnd: true,
		};
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.gotoBack
		);
	};

	onFocusScreen = () => {
		this.setState(
			{
				page: 1,
				orders: [],
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

	componentWillUnmount = () => {
		this.focusListner();
		this.backHandler.remove();
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

		OrderService.getAll(reqData)
			.then((response) => {
				const data: Array<any> = response.data;
				const { orders, isRefresing } = this.state;
				const allOrders: Array<any> =
					isRefresing === true ? [...data] : [...orders, ...data];

				this.setState({
					orders: allOrders,
					isListEnd: allOrders.length === Number(response.count),
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
				});
			})
			.catch((error) => {
				this.setState({
					page: 1,
					orders: [],
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
					isListEnd: true,
				});
			});
	};

	onSearch = (searchtxt: string) => {
		this.setState({ searchValue: searchtxt });
	};
	getListHeaderComponent = () => (
		<View style={styles.searchContainer}>
			<View style={styles.searchIcon}>
				<FontAwesomeIcon
					icon={faMagnifyingGlass}
					size={16}
					color={Colors.mediumGrey}
				/>
			</View>
			<TextInput
				autoCapitalize="none"
				placeholder="Search..."
				placeholderTextColor={Colors.mediumGrey}
				style={styles.searchField}
				value={this.state.searchValue}
				onChangeText={this.onSearch}
			/>
			{this.state.isSearching ? (
				<View style={styles.optionsIcon}>
					<ActivityIndicator size="small" color={Colors.mediumGrey} />
				</View>
			) : null}
		</View>
	);

	gotoOrderDetails = (item: any) => {
		this.props.navigation.navigate("OrderDetails", {
			orderId: item._id,
			orderNo: item.orderNumber,
			orderItemId: item.orderItems._id,
		});
	};

	getStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case OrderStatus.PENDING:
				icon = faExclamation;
				break;
			case OrderStatus.COMPLETED:
			case OrderStatus.PLACED:
				icon = faCheck;
				break;
			case OrderStatus.RESCHEDULED:
				icon = faArrowRotateRight;
				break;
			case OrderStatus.CANCELLED:
				icon = faXmark;
				break;
			default:
				break;
		}
		return icon;
	};

	renderItem = ({ item }: any) => {
		const status: string = item.orderItems.status;
		return (
			<Card
				onPress={this.gotoOrderDetails.bind(this, item)}
				style={styles.itemContainer}
			>
				<>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							borderBottomWidth: 1,
							borderStyle: "dotted",
							borderBottomColor: Colors.lightBorder,
							paddingBottom: 5,
						}}
					>
						<View>
							<Text
								style={{
									fontFamily: "Roboto-Medium",
									fontWeight: "500",
									fontSize: 14,
									color: Colors.primaryFont,
								}}
							>{`#${item.orderNumber}`}</Text>
						</View>
						{item.orderItems.status === OrderStatus.PLACED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: OrderStatusBackgroundColor.PLACED,
										borderColor: OrderStatusBorderColor.PLACED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor: OrderStatusIconBackgroundColor.PLACED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.orderItems.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.orderItems.status === OrderStatus.COMPLETED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: OrderStatusBackgroundColor.COMPLETED,
										borderColor: OrderStatusBorderColor.COMPLETED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor: OrderStatusIconBackgroundColor.COMPLETED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.orderItems.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.orderItems.status === OrderStatus.CANCELLED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: OrderStatusBackgroundColor.CANCELLED,
										borderColor: OrderStatusBorderColor.CANCELLED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor: OrderStatusIconBackgroundColor.CANCELLED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.orderItems.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.orderItems.status === OrderStatus.PENDING ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: OrderStatusBackgroundColor.PENDING,
										borderColor: OrderStatusBorderColor.PENDING,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor: OrderStatusIconBackgroundColor.PENDING,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.orderItems.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.orderItems.status === OrderStatus.RESCHEDULED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: OrderStatusBackgroundColor.RESCHEDULED,
										borderColor: OrderStatusBorderColor.RESCHEDULED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												OrderStatusIconBackgroundColor.RESCHEDULED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.orderItems.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : null}
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
								width: "65%",
								height: "auto",
							}}
						>
							<View style={{ width: "100%", flexDirection: "row" }}>
								<View style={{ width: "30%" }}>
									{item.product.thumbnail !== null && (
										<Image
											resizeMode="contain"
											source={{ uri: item.product.thumbnail }}
											style={{
												width: 60,
												height: 60,
												borderRadius: 8,
											}}
										/>
									)}

									{item.product.thumbnail === null &&
										item.product.category === ProductCategory.CAR_RENTAL && (
											<View
												style={{
													width: 60,
													height: 60,
													padding: 10,
													backgroundColor: Colors.secondaryAlpha1,
													borderRadius: 30,
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<FontAwesomeIcon
													icon={faCar}
													size={30}
													color={Colors.secondary}
												/>
											</View>
										)}
								</View>
								<View style={{ width: "70%", paddingLeft: 5 }}>
									<Text
										style={[styles.titleText, { marginBottom: 2 }]}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{item.product.name}
									</Text>
									<Text style={[styles.productCategoryTxt]}>
										{toUpperCaseWord(item.product.category).replaceAll(
											"_",
											" "
										)}
									</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								width: "35%",
								height: "auto",
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
									style={[styles.regularFont, { color: Colors.primaryBtn }]}
								>
									{item.price.code}
								</Text>
								<Text style={[styles.boldFont, { fontSize: 16 }]}>
									{` ${Number(item.price.value).toFixed(2)}`}
								</Text>
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
							{item.product.seller.name}
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

	keyExtractor = (item: any) => item.orderItems._id;

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
			<Header title={"My Orders"} onBackAction={this.gotoBack} />

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
					<>
						{/* {this.getListHeaderComponent()} */}
						<FlatList
							data={this.state.orders}
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
								this.state.orders.length <= 0 ? { flex: 1 } : null
							}
						/>
					</>
				)}
			</WhiteContainer>
		</Container>
	);
}

const styles = StyleSheet.create({
	itemContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.greyBtnBg,
		borderRadius: 10,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 34,
		marginVertical: 7,
		// elevation: 0,
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
	statusBox: {
		flexDirection: "row",
		borderWidth: 1,
		borderRadius: 25,
		alignItems: "center",
		height: 30,
		width: "auto",
		minWidth: 50,
		paddingHorizontal: 6,
		paddingRight: 10,
	},
	statusText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
		color: Colors.primaryFont,
		opacity: 0.6,
	},
	statusIconBackground: {
		justifyContent: "center",
		alignItems: "center",
		width: 20,
		height: 20,
		borderRadius: 50,
		marginRight: 5,
	},
	titleText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: Colors.primaryBg,
	},
	productCategoryTxt: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.lightFont,
	},
	searchContainer: {
		width: "95%",
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 90,
		paddingHorizontal: 5,
		marginBottom: 8,
		marginHorizontal: 10,
	},
	searchIcon: {
		width: "8%",
		alignItems: "center",
		justifyContent: "center",
	},
	searchField: {
		height: 38,
		width: "82%",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	optionsIcon: {
		width: 35,
		height: 35,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 50,
	},
});
