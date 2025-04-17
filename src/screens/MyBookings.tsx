import React from "react";
import {
	StyleSheet,
	FlatList,
	ActivityIndicator,
	Text,
	View,
	BackHandler,
} from "react-native";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { faXmark } from "@fortawesome/pro-solid-svg-icons/faXmark";
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
import BookingStatus, {
	BookingStatusBackgroundColor,
	BookingStatusBorderColor,
	BookingStatusIconBackgroundColor,
} from "../configs/BookingStatus";
import { MyBookingsScreenProps } from "../navigation/NavigationTypes";
import BookingService from "../services/BookingService";
import { toUpperCaseWord } from "../utils/Util";
import AppContext from "../context/AppContext";
import ProductCategory from "../configs/ProductCategory";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

type States = {
	page: number;
	bookings: Array<any>;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isListEnd: boolean;
};

export default class MyBookings extends React.Component<
	MyBookingsScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private focusListner: any;
	private backHandler: any;

	constructor(props: any) {
		super(props);

		this.state = {
			page: 1,
			bookings: [],
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

	componentWillUnmount = () => {
		this.focusListner();
		this.backHandler.remove();
	};

	onFocusScreen = () => {
		this.setState(
			{
				page: 1,
				bookings: [],
				isLoading: true,
				isRefresing: false,
				isLoadMore: false,
				isListEnd: true,
			},
			() => {
				this.fetchBookings();
			}
		);
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true, page: 1 }, () => {
			this.fetchBookings();
		});
	};

	handelLoadMore = () => {
		this.setState({ isLoadMore: true, page: this.state.page + 1 }, () => {
			this.fetchBookings();
		});
	};

	fetchBookings = () => {
		const { userData } = this.context;
		const reqData = {
			page: this.state.page,
			limit: Constant.DEFAULT_LIMIT,
			customerId: userData?._id,
		};

		BookingService.getAll(reqData)
			.then((response) => {
				const data: Array<any> = response.data;
				const { bookings, isRefresing } = this.state;
				const allBookings: Array<any> =
					isRefresing === true ? [...data] : [...bookings, ...data];

				this.setState({
					bookings: allBookings,
					isListEnd: allBookings.length === Number(response.count),
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
				});
			})
			.catch((error) => {
				this.setState({
					page: 1,
					bookings: [],
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
					isListEnd: true,
				});
			});
	};

	gotoBookingDetails = (item: any) => {
		this.props.navigation.navigate("BookingDetails", {
			bookingNo: item.bookingNumber,
			bookingId: item._id,
		});
	};

	getStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case BookingStatus.PENDING:
				icon = faExclamation;
				break;
			case BookingStatus.ACCEPTED:
			case BookingStatus.CONFIRMED:
				icon = faCheck;
				break;
			case BookingStatus.RESCHEDULE_CONFIRMED:
				icon = faArrowRotateRight;
				break;
			case BookingStatus.REJECTED:
			case BookingStatus.CANCELLED:
				icon = faXmark;
				break;
			default:
				break;
		}
		return icon;
	};

	renderItem = ({ item }: any) => {
		const status = item.status;

		return (
			<Card
				onPress={this.gotoBookingDetails.bind(this, item)}
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
							>{`#${item.bookingNumber}`}</Text>
						</View>
						{item.status === BookingStatus.ACCEPTED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: BookingStatusBackgroundColor.ACCEPTED,
										borderColor: BookingStatusBorderColor.ACCEPTED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												BookingStatusIconBackgroundColor.ACCEPTED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.status === BookingStatus.CONFIRMED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: BookingStatusBackgroundColor.CONFIRMED,
										borderColor: BookingStatusBorderColor.CONFIRMED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												BookingStatusIconBackgroundColor.CONFIRMED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.status === BookingStatus.PENDING ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: BookingStatusBackgroundColor.PENDING,
										borderColor: BookingStatusBorderColor.PENDING,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor: BookingStatusIconBackgroundColor.PENDING,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.status === BookingStatus.RESCHEDULE_CONFIRMED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor:
											BookingStatusBackgroundColor.RESCHEDULE_CONFIRMED,
										borderColor: BookingStatusBorderColor.RESCHEDULE_CONFIRMED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												BookingStatusIconBackgroundColor.RESCHEDULE_CONFIRMED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.status === BookingStatus.CANCELLED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: BookingStatusBackgroundColor.CANCELLED,
										borderColor: BookingStatusBorderColor.CANCELLED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												BookingStatusIconBackgroundColor.CANCELLED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
										size={14}
										color={Colors.white}
									/>
								</View>
								<Text style={[styles.statusText]}>
									{toUpperCaseWord(status.toLowerCase())}
								</Text>
							</View>
						) : item.status === BookingStatus.REJECTED ? (
							<View
								style={[
									styles.statusBox,
									{
										backgroundColor: BookingStatusBackgroundColor.REJECTED,
										borderColor: BookingStatusBorderColor.REJECTED,
									},
								]}
							>
								<View
									style={[
										styles.statusIconBackground,
										{
											backgroundColor:
												BookingStatusIconBackgroundColor.REJECTED,
										},
									]}
								>
									<FontAwesomeIcon
										icon={this.getStatusIcon(item.status)}
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
						<View style={{ width: "100%", flexDirection: "row" }}>
							<View
								style={{
									width: 40,
									height: 40,
									padding: 10,
									backgroundColor: Colors.secondaryAlpha1,
									borderRadius: 20,
								}}
							>
								{item.product.category === ProductCategory.CAR_RENTAL && (
									<FontAwesomeIcon
										icon={faCar}
										size={20}
										color={Colors.secondary}
									/>
								)}
							</View>
							<View style={{ flex: 1, marginLeft: 10 }}>
								<Text
									style={[styles.titleText, { marginBottom: 2 }]}
									numberOfLines={1}
									ellipsizeMode="tail"
								>
									{item.product.name}
								</Text>
								<Text style={styles.productCategoryTxt}>
									{`${toUpperCaseWord(item.product.category).replaceAll(
										"_",
										" "
									)} ${toUpperCaseWord(item.product.subCategory).replaceAll(
										"_",
										" "
									)}`}
								</Text>
							</View>
						</View>
					</View>
					<View
						style={{
							marginTop: 5,
						}}
					>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "flex-end",
							}}
						>
							<View
								style={{
									marginRight: 5,
								}}
							>
								<FontAwesomeIcon icon={faClock} size={12} />
							</View>
							<Text
								style={{
									fontFamily: "Roboto-Medium",
									fontWeight: "500",
									fontSize: 12,
									color: Colors.primaryFont,
								}}
							>
								{moment.utc(item.bookingDateTime).format("Do MMMM, YYYY HH:mm")}
							</Text>
						</View>
					</View>
				</>
			</Card>
		);
	};

	keyExtractor = (item: any) => item._id;

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
						<Text style={styles.value}>Loading...</Text>
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
			<Header title={"My Bookings"} onBackAction={this.gotoBack} />
			<WhiteContainer style={{ paddingHorizontal: 7, paddingTop: 7 }}>
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
											width={170}
											height={10}
											borderRadius={3}
										/>
									</SkeletonPlaceholder.Item>
								</SkeletonPlaceholder>
							</View>
						))}
					</>
				) : (
					<FlatList
						data={this.state.bookings}
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
							this.state.bookings.length <= 0 ? { flex: 1 } : null
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
		fontSize: 13,
		color: Colors.primaryFont,
		opacity: 1,
	},
	regularFont: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
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
});
