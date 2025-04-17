import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	FlatList,
	Alert,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircle } from "@fortawesome/pro-light-svg-icons/faCircle";
import { faCircleExclamation } from "@fortawesome/pro-regular-svg-icons/faCircleExclamation";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons/faCircleCheck";
import Snackbar from "react-native-snackbar";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	NoResult,
	Button,
	OverlayLoader,
} from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { SimtexQuotationScreenProps } from "../../navigation/NavigationTypes";
import ProductService from "../../services/ProductService";
import AppContext, { UserDataModel } from "../../context/AppContext";
import CartService from "../../services/CartService";
import LocalizedText from "../../resources/LocalizedText";
import { SimtexType } from "../../configs/Simtex";

type States = {
	country: string;
	countryId: string;
	countryName: string;
	days: number;
	currency: string;
	quoteId: undefined | string;
	quoteOptions: Array<any>;
	selectedPackage: any;
	selectedPackageIndex: number | null;
	quantity: number;
	topUpPackageSelected: boolean;
	isLoading: boolean;
	isRefresing: boolean;
	showOverlayModal: boolean;
};

export default class SimtexQuotation extends React.Component<
	SimtexQuotationScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: SimtexQuotationScreenProps) {
		super(props);
		this.state = {
			country: props.route.params.country,
			countryId: "",
			countryName: "",
			days: props.route.params.days,
			currency: props.route.params.currency,
			quoteId: undefined,
			quoteOptions: [],
			selectedPackage: null,
			selectedPackageIndex: null,
			quantity: 1,
			topUpPackageSelected: false,
			isLoading: true,
			isRefresing: false,
			showOverlayModal: false,
		};
	}

	componentDidMount = () => {
		this.setState({ selectedPackage: null }, () => {
			this.loadQuotations();
		});
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true }, () => {
			this.loadQuotations();
		});
	};

	loadQuotations = () => {
		if (this.props.route.params.type === SimtexType.FIRST_RECHARGE) {
			const reqData: any = {
				country: this.state.country,
				days: Number(this.state.days),
				toCurrency: this.state.currency,
			};

			ProductService.getSimtexQuotations(reqData)
				.then((response: any) => {
					this.setState({
						quoteId: response.id,
						quoteOptions: response.quoteOptions,
						isLoading: false,
						isRefresing: false,
					});
				})
				.catch((error) => {
					this.setState({
						quoteOptions: [],
						isLoading: false,
						isRefresing: false,
					});
				});
		} else {
			const reqData: any = {
				eSIMId: this.props.route.params.esimId,
				country: this.state.country,
				days: Number(this.state.days),
				toCurrency: this.state.currency,
			};
			ProductService.getsimtexTopupQuotations(reqData)
				.then((response: any) => {
					this.setState({
						quoteId: response.id,
						quoteOptions: response.quoteOptions,
						isLoading: false,
						isRefresing: false,
					});
				})
				.catch((error) => {
					this.setState({
						quoteOptions: [],
						isLoading: false,
						isRefresing: false,
					});
				});
		}
	};

	onPressPackage = (item: any, index: number) => {
		if (this.props.route.params.type === SimtexType.FIRST_RECHARGE) {
			this.setState({
				selectedPackage: item,
				countryId: item.country._id,
				countryName: item.country.name,
				selectedPackageIndex: index,
				topUpPackageSelected: true,
			});
		} else {
			this.setState({ selectedPackage: item, topUpPackageSelected: true });
		}
	};

	// onContinue = () => {
	// 	const { selectedPackage } = this.state;
	// 	if (selectedPackage !== null) {
	// 		this.props.navigation.navigate("Payment", {
	// 			orderAmount: Number(selectedPackage.targetedPrice.value),
	// 			currency: this.state.currency,
	// 			productId: this.props.route.params.productId,
	// 			quoteId: this.state.quoteId,
	// 			planId: selectedPackage.id,
	// 		});
	// 	} else {
	// 		Alert.alert("Warning", "Please choose a package.");
	// 	}
	// };

	onAddToCart = () => {
		const { selectedPackage, quantity } = this.state;

		setTimeout(() => {
			this.setState({ showOverlayModal: true }, () => {
				const payload = {
					productId: this.props.route.params.productId,
					currencyCode: this.state.currency,
					price: Number(selectedPackage.targetedPrice.value),
					quantity: Number(quantity),
					quoteId: this.state.quoteId,
					planId: selectedPackage.id,
					countryId: this.state.countryId,
					countryName: this.state.countryName,
					selectedPlan:
						this.state.selectedPackageIndex === 0
							? "Light-Weight"
							: this.state.selectedPackageIndex === 1
							? "Mid-Sized"
							: "Heavy-User",
					selectedPlanSize: selectedPackage.totalQuotaGB,
				};

				CartService.add(payload)
					.then((response) => {
						const resData = response.data;
						this.setState({ showOverlayModal: false }, () => {
							const { userData } = this.context;
							// const totalCartItems: number =
							// 	Number(userData?.total_cart_items) + 1;
							this.context.setUserData({
								...(userData as UserDataModel),
								total_cart_items: resData.cartItem,
							});

							setTimeout(() => {
								Snackbar.show({
									text: LocalizedText.ITEM_ADDED_TO_YOUR_CART,
									duration: Snackbar.LENGTH_LONG,
									action: {
										text: "View",
										textColor: Colors.secondary,
										onPress: this.gotoCart,
									},
								});
							}, 350);
						});
					})
					.catch((error) => {
						this.setState({ showOverlayModal: false });
					});
			});
		}, 250);
	};

	onTopUpPayment = (selectedPackageData: any) => {
		let orderAmount: number = Number(selectedPackageData.targetedPrice.value);
		this.props.navigation.navigate("TopUpPayment", {
			productId: this.props.route.params.productId,
			productName: this.props.route.params.productName,
			orderAmount: orderAmount,
			orderCurrency: this.state.currency,
			quoteId: this.state.quoteId,
			planId: selectedPackageData.id,
			esimId: this.props.route.params.esimId,
		});
	};

	gotoCart = () => {
		this.props.navigation.navigate("Cart");
	};

	listEmptyComponent = () => (
		<NoResult
			title={"No Results Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	renderItem = ({ item, index }: any) => {
		const { selectedPackage } = this.state;
		const id: string = item.id;
		const isChecked: boolean =
			selectedPackage !== null
				? selectedPackage.id === id
					? true
					: false
				: false;
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				style={styles.row}
				onPress={this.onPressPackage.bind(this, item, index)}
			>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<View style={{ flex: 1 }}>
						<Text style={styles.subText}>
							{index === 0
								? "Light-Weight"
								: index === 1
								? "Mid-Sized"
								: "Heavy-User"}
						</Text>
						<Text style={styles.title}>{`${item.totalQuotaGB} GB`}</Text>
					</View>
					<View
						style={{
							width: 100,
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "flex-end",
						}}
					>
						<Text style={styles.subText}>{`${item.targetedPrice.code} `}</Text>
						<Text style={styles.title}>
							{Number(item.targetedPrice.value).toFixed(2)}
						</Text>
					</View>
					<View
						style={{
							width: 50,
							alignItems: "flex-end",
							justifyContent: "center",
						}}
					>
						<FontAwesomeIcon
							icon={isChecked ? faCircleCheck : faCircle}
							size={20}
							color={Colors.primaryBtn}
						/>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item.id;

	getListHeaderComponent = () => (
		<View style={styles.simtexAlertBox}>
			<View style={{ width: 30, alignItems: "flex-start" }}>
				<FontAwesomeIcon
					icon={faCircleExclamation}
					size={20}
					color={Colors.primary}
				/>
			</View>
			<View style={{ flex: 1 }}>
				<Text style={styles.simtexAlertText}>
					{
						"The data package can be used for any internet purpose and does not support calls or SMS. You can use every app that is based on an internet connection."
					}
				</Text>
			</View>
		</View>
	);

	render = () => {
		return (
			<Container>
				<Header title="Choose Package" />
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
					) : (
						<>
							<FlatList
								data={this.state.quoteOptions}
								renderItem={this.renderItem}
								keyExtractor={this.keyExtractor}
								refreshing={this.state.isRefresing}
								onRefresh={this.handelRefresh}
								showsVerticalScrollIndicator={false}
								ListHeaderComponent={this.getListHeaderComponent.bind(this)}
								// ListFooterComponent={this.getListFooterComponent.bind(this)}
								ListEmptyComponent={this.listEmptyComponent.bind(this)}
								contentContainerStyle={
									this.state.quoteOptions.length <= 0 ? { flex: 1 } : null
								}
							/>
							{this.props.route.params.type === SimtexType.FIRST_RECHARGE ? (
								<Button
									title={LocalizedText.ADD_TO_CART}
									disabled={this.state.topUpPackageSelected ? false : true}
									onPress={this.onAddToCart}
									style={{ width: Constant.WINDOW_WIDTH - 30, margin: 15 }}
								/>
							) : (
								<Button
									title={"Pay Now"}
									disabled={this.state.topUpPackageSelected ? false : true}
									onPress={() =>
										this.onTopUpPayment(this.state.selectedPackage)
									}
									style={{ width: Constant.WINDOW_WIDTH - 30, margin: 15 }}
								/>
							)}
						</>
					)}
				</WhiteContainer>
				<OverlayLoader visible={this.state.showOverlayModal} />
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 5,
		paddingHorizontal: 0,
	},
	row: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		marginHorizontal: 15,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	title: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		lineHeight: 21,
		opacity: 0.9,
	},
	subText: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		opacity: 0.9,
	},
	simtexAlertBox: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		flexDirection: "row",
		margin: 15,
		padding: 10,
		backgroundColor: Colors.secondaryAlpha2,
		borderRadius: 5,
	},
	simtexAlertText: {
		fontSize: 12,
		color: Colors.lightFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		lineHeight: 18,
	},
});
