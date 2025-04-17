import React from "react";
import {
	StyleSheet,
	TouchableHighlight,
	Text,
	View,
	FlatList,
	Keyboard,
	Alert,
	Image,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSimCards } from "@fortawesome/pro-solid-svg-icons/faSimCards";
import DropDownPicker from "react-native-dropdown-picker";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	NoResult,
	BottomSheet,
	Button,
	InputField,
} from "../../components";
import LocalizedText from "../../resources/LocalizedText";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { EsimProductListScreenProps } from "../../navigation/NavigationTypes";
import ProductService from "../../services/ProductService";
import AppContext, { SearchItem } from "../../context/AppContext";
import { SimtexType } from "../../configs/Simtex";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const validationSchema = Yup.object().shape({
	productId: Yup.string().required("Product Id is required"),
	country: Yup.string().required("Country is required"),
	days: Yup.string()
		.required("Days number is required")
		.matches(/^[1-9]\d*$/, "Days should be greater than 0")
		.test("days", "Should be in between 1 to 60", (value) => {
			return Number(value) >= 1 && Number(value) <= 60;
		}),
	// currency: Yup.string().required("Currency is required"),
});

type FormModel = {
	productId: string;
	productName: string;
	country: string;
	days: string;
	// currency: string;
	currencyCode: string;
};

type States = {
	products: Array<any>;
	currencies: Array<any>;
	// selectedCurrency: null | string;
	isLoading: boolean;
	isRefresing: boolean;
	isModalOpen: boolean;
	isDropdownOpen: boolean;
};

export default class EsimProductList extends React.Component<
	EsimProductListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: EsimProductListScreenProps) {
		super(props);
		this.state = {
			products: [],
			currencies: [],
			// selectedCurrency: null,
			isLoading: true,
			isRefresing: false,
			isModalOpen: false,
			isDropdownOpen: false,
		};

		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		this.loadProducts();
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true }, () => {
			this.loadProducts();
		});
	};

	loadProducts = () => {
		const { userData, getLatestSearchData } = this.context;
		const searchData: null | SearchItem = getLatestSearchData();
		const reqData: any = {
			searchText:
				searchData?.type === Constant.SEARCH_ITEM_TYPE_AIRPORT
					? searchData.iataCode
					: searchData?.name,
			type: searchData?.type,
			toCurrency: userData?.currency.code as string,
		};

		if (searchData?.type !== Constant.SEARCH_ITEM_TYPE_COUNTRY) {
			reqData.country = searchData?.country;
		}

		Promise.all([
			ProductService.getSimtexCurrencies(),
			ProductService.getEsimProducts(reqData),
		])
			.then((response) => {
				const simtexCurrencies: Array<any> = response[0];
				const currencyOptions: Array<any> = simtexCurrencies.map(
					(item: any) => ({
						label: item.currencyCode,
						value: item.currencyCode,
					})
				);

				this.setState({
					currencies: currencyOptions,
					products: response[1],
					isLoading: false,
					isRefresing: false,
				});
			})
			.catch((error) => {
				this.setState({
					currencies: [],
					products: [],
					isLoading: false,
					isRefresing: false,
				});
			});

		// ProductService.getEsimProducts(reqData)
		// 	.then((response: Array<any>) => {
		// 		this.setState({
		// 			products: response,
		// 			isLoading: false,
		// 			isRefresing: false,
		// 		});
		// 	})
		// 	.catch((error) => {
		// 		this.setState({
		// 			products: [],
		// 			isLoading: false,
		// 			isRefresing: false,
		// 		});
		// 	});
	};

	gotoProductDetails = (item: any) => {
		const { userData } = this.context;

		if (userData !== null) {
			this.openModal(item._id, item.name);
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							this.props.navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	openModal = (productId: string, productName: string) => {
		this.setState({ isModalOpen: true, isDropdownOpen: false }, () => {
			const { getLatestSearchData } = this.context;
			const searchData: null | SearchItem = getLatestSearchData();

			if (this.formikRef !== null) {
				this.formikRef.current?.setFieldValue("productId", productId);
				this.formikRef.current?.setFieldValue("productName", productName);
				this.formikRef.current?.setFieldValue("country", searchData?.country);
				// this.formikRef.current?.setFieldValue(
				// 	"currency",
				// 	this.state.selectedCurrency
				// );
			}
		});
	};

	closeModal = () => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false });
	};

	// toggleDropdown = () => {
	// 	this.setState({ isDropdownOpen: !this.state.isDropdownOpen });
	// };

	// closeDropdown = () => {
	// 	this.setState({ isDropdownOpen: false });
	// };

	// onChangeCurrency = (callback: Function) => {
	// 	this.setState(
	// 		(state) => ({
	// 			selectedCurrency: callback(state.selectedCurrency),
	// 		}),
	// 		() => {
	// 			this.formikRef &&
	// 				this.formikRef.current?.setFieldValue(
	// 					"currency",
	// 					this.state.selectedCurrency
	// 				);
	// 		}
	// 	);
	// };

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: FormModel) => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false }, () => {
			setTimeout(() => {
				this.props.navigation.navigate("SimtexQuotation", {
					country: values.country,
					days: Number(values.days),
					currency: values.currencyCode,
					productId: values.productId,
					productName: values.productName,
					type: SimtexType.FIRST_RECHARGE,
				});
			}, 300);
		});
	};

	listEmptyComponent = () => (
		<NoResult
			title={"No Results Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	renderItem = ({ item }: any) => {
		return (
			<TouchableHighlight
				underlayColor={Colors.lightGrey}
				style={styles.row}
				onPress={this.gotoProductDetails.bind(this, item)}
			>
				<View style={{ flexDirection: "row" }}>
					{/* <FontAwesomeIcon
						icon={faSimCards}
						size={25}
						color={Colors.secondary}
						style={{ marginRight: 10, marginTop: 5 }}
					/> */}
					<Image
						resizeMode="contain"
						source={{ uri: item.url }}
						style={{
							width: 40,
							height: 40,
							borderRadius: 8,
						}}
					/>
					<View style={{ flex: 1, paddingHorizontal: 8 }}>
						<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
							{item.name}
						</Text>
						<Text style={styles.subText}>{item.seller.name}</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	keyExtractor = (item: any) => item._id;

	render = () => {
		return (
			<Container>
				<Header title="e-SIM" />
				<WhiteContainer style={styles.container}>
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
												height={6}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={90}
												height={6}
												borderRadius={3}
												marginBottom={15}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={6}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={6}
												borderRadius={3}
											/>
										</SkeletonPlaceholder.Item>
									</SkeletonPlaceholder>
								</View>
							))}
						</>
					) : (
						<FlatList
							data={this.state.products}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							refreshing={this.state.isRefresing}
							onRefresh={this.handelRefresh}
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={this.listEmptyComponent.bind(this)}
							contentContainerStyle={
								this.state.products.length <= 0 ? { flex: 1 } : null
							}
						/>
					)}
				</WhiteContainer>
				<BottomSheet
					isVisible={this.state.isModalOpen}
					title={"Get Quote"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.closeModal}
				>
					<View style={{ padding: 20 }}>
						<Formik
							initialValues={{
								productId: "",
								productName: "",
								country: "",
								days: "",
								// currency: "",
								currencyCode: "USD",
							}}
							validationSchema={validationSchema}
							onSubmit={this.onSubmit}
							innerRef={this.formikRef}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								touched,
								errors,
								values,
							}) => (
								<>
									<InputField
										editable={false}
										value={values.country}
										label={"Country"}
										autoCapitalize="none"
										onChangeText={handleChange("country")}
										onBlur={handleBlur("country")}
										error={touched.country ? errors.country : null}
									/>
									<InputField
										value={`${values.days}`}
										label={"Number of Days"}
										keyboardType="number-pad"
										autoCapitalize="none"
										onChangeText={handleChange("days")}
										onBlur={handleBlur("days")}
										error={touched.days && errors.days ? errors.days : null}
										style={{ marginBottom: 25 }}
									/>

									<InputField
										value={values.currencyCode}
										label={"Currency"}
										autoCapitalize="none"
										onChangeText={handleChange("currencyCode")}
										onBlur={handleBlur("currencyCode")}
										editable={false}
									/>

									{/* <DropDownPicker
										open={this.state.isDropdownOpen}
										value={this.state.selectedCurrency}
										items={this.state.currencies}
										setOpen={this.toggleDropdown}
										setValue={this.onChangeCurrency}
										zIndex={9999}
										placeholder="Currency"
										containerStyle={{
											borderWidth: 0,
											marginTop: 10,
										}}
										style={[
											{
												borderRadius: 0,
												borderColor: Colors.lightBorder,
												borderTopWidth: 0,
												borderLeftWidth: 0,
												borderRightWidth: 0,
												paddingLeft: 0,
											},
											touched.currency && errors.currency
												? { borderColor: Colors.danger }
												: null,
										]}
										placeholderStyle={{
											fontFamily: "Roboto-Regular",
											fontWeight: "400",
											fontSize: 14,
											color: Colors.mediumGrey,
										}}
										dropDownContainerStyle={{
											backgroundColor: Colors.white,
											elevation: 5,
											borderColor: Colors.white,
											marginTop: 5,
										}}
										listItemLabelStyle={{
											color: Colors.secondaryFont,
											fontFamily: "Roboto-Regular",
											fontWeight: "400",
											fontSize: 14,
											opacity: 0.9,
										}}
										selectedItemLabelStyle={{
											color: Colors.secondaryFont,
											fontFamily: "Roboto-Medium",
											fontWeight: "500",
											fontSize: 14,
										}}
									/>
									{touched.currency && errors.currency ? (
										<Text style={styles.errorText}>{errors.currency}</Text>
									) : null} */}
									<Button
										title={"Get Quotation"}
										style={{ marginTop: 30, width: "100%" }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</View>
				</BottomSheet>
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 8,
		paddingHorizontal: 0,
	},
	skeletonContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 10,
		width: "100%",
		alignSelf: "center",
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
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
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
		opacity: 0.8,
	},
	errorText: {
		fontSize: 11,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.danger,
		marginTop: 3,
	},
});
