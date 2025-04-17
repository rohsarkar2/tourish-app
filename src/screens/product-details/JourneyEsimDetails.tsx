import React from "react";
import {
	StyleSheet,
	View,
	Text,
	ScrollView,
	Linking,
	Keyboard,
	FlatList,
	TouchableHighlight,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLink } from "@fortawesome/pro-solid-svg-icons/faLink";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons/faChevronRight";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";
import { faXmark } from "@fortawesome/pro-solid-svg-icons/faXmark";
import { faExclamation } from "@fortawesome/pro-solid-svg-icons/faExclamation";
import { faArrowRotateLeft } from "@fortawesome/pro-solid-svg-icons/faArrowRotateLeft";
import { faCircleExclamation } from "@fortawesome/pro-regular-svg-icons/faCircleExclamation";
import AnimatedProgressWheel from "react-native-progress-wheel";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
//@ts-ignore
import Image from "react-native-remote-svg";
import {
	Container,
	WhiteContainer,
	Header,
	Loader,
	Card,
	Button,
	BottomSheet,
	AutoCompleteInput,
	InputField,
} from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { JourneyEsimDetailsScreenProps } from "../../navigation/NavigationTypes";
import ProductService from "../../services/ProductService";
import {
	getEsimQrImageUrl,
	IN_APP_BROWSER_OPTIONS,
	toUpperCaseWord,
} from "../../utils/Util";
import AppContext, { SearchItem } from "../../context/AppContext";
import DropDownPicker from "react-native-dropdown-picker";
import {
	EsimStatus,
	EsimStatusBackgroundColor,
	EsimStatusBorderColor,
	EsimStatusIconBackgroundColor,
	EsimStatusText,
	SimtexType,
} from "../../configs/Simtex";
import debounce from "lodash.debounce";
import { searchCountry } from "../../services/ApiService";
import moment from "moment-timezone";
import {
	DataPackageStatus,
	DataPackageStatusBackgroundColor,
	DataPackageStatusBorderColor,
	DataPackageStatusIconBackgroundColor,
} from "../../configs/EsimDataPackageStatus";

const validationSchema = Yup.object().shape({
	countryName: Yup.string().required("Country is required"),
	days: Yup.string()
		.required("Days number is required")
		.matches(/^[1-9]\d*$/, "Days should be greater than 0")
		.test("days", "Should be in between 1 to 60", (value) => {
			return Number(value) >= 1 && Number(value) <= 60;
		}),
	// currency: Yup.string().required("Currency is required"),
});

type FormModel = {
	countryTxt: string;
	countryName: string;
	days: string;
	// currency: string;
	currencyCode: string;
};

type States = {
	esimData: any;
	isModalOpen: boolean;
	currencies: Array<any>;
	allCountries: Array<any>;
	// selectedCurrency: null | string;
	isSearchingCountry: boolean;
	isCountryResultHide: boolean;
	isLoading: boolean;
	isDropdownOpen: boolean;
};

export default class JourneyEsimDetails extends React.Component<
	JourneyEsimDetailsScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;
	private focusListner: any;

	constructor(props: JourneyEsimDetailsScreenProps) {
		super(props);

		this.state = {
			esimData: null,
			currencies: [],
			allCountries: [],
			// selectedCurrency: null,
			isModalOpen: false,
			isSearchingCountry: false,
			isCountryResultHide: false,
			isLoading: true,
			isDropdownOpen: false,
		};
		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount = () => {
		this.focusListner();
	};

	onFocusScreen = () => {
		Promise.all([
			ProductService.getSimtexEsimDetails(this.props.route.params.esimId),
			ProductService.getSimtexCurrencies(),
		])
			.then((response) => {
				const simtexCurrencies: Array<any> = response[1];
				const currencyOptions: Array<any> = simtexCurrencies.map(
					(item: any) => ({
						label: item.currencyCode,
						value: item.currencyCode,
					})
				);
				this.setState({
					esimData: response[0],
					currencies: currencyOptions,
					isLoading: false,
				});
			})
			.catch((error) => {
				this.setState({
					esimData: null,
					currencies: [],
					isLoading: false,
				});
			});
	};

	onChangeCountry = (value: string) => {
		let trimValue: string = value.trim();
		this.formikRef &&
			this.formikRef.current?.setFieldValue("countryTxt", value);

		if (trimValue.length > 2) {
			const searchMethod = debounce(() => {
				this.setState({ isSearchingCountry: true }, () => {
					searchCountry(value)
						.then((response: any) => {
							this.setState({
								allCountries: response.data,
								isCountryResultHide: false,
								isSearchingCountry: false,
							});
						})
						.catch((error) => {
							this.setState({ isSearchingCountry: false });
						});
				});
			});

			searchMethod();
		} else {
			this.setState({
				isSearchingCountry: false,
				isCountryResultHide: true,
				allCountries: [],
			});
		}
	};

	onClearCountry = () => {
		Keyboard.dismiss();
		this.setState({ isCountryResultHide: true }, () => {
			this.formikRef &&
				this.formikRef.current?.setFieldValue("countryName", "");
			this.formikRef && this.formikRef.current?.setFieldValue("countryTxt", "");
		});
	};

	onSelectCountryItem = (item: any) => {
		Keyboard.dismiss();
		this.setState(
			{
				isCountryResultHide: true,
			},
			() => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue("countryTxt", item.name);
				this.formikRef &&
					this.formikRef.current?.setFieldValue("countryName", item.name);
			}
		);
	};

	openInstructionLink = async (eSIMId: string) => {
		const link: string = `https://customers.simtex.io/#/status/${eSIMId}`;
		const isAvailable: boolean = await InAppBrowser.isAvailable();

		if (isAvailable) {
			await InAppBrowser.open(link, IN_APP_BROWSER_OPTIONS);
		} else {
			Linking.openURL(link);
		}
	};

	openModal = () => {
		this.setState({ isModalOpen: true, isDropdownOpen: false }, () => {
			const { getLatestSearchData } = this.context;
			const searchData: null | SearchItem = getLatestSearchData();

			if (this.formikRef !== null) {
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
					country: values.countryName,
					days: Number(values.days),
					currency: values.currencyCode,
					esimId: this.props.route.params.esimId,
					type: SimtexType.TOP_UP_RECHARGE,
				});
			}, 300);
		});
	};

	renderResultList = (listProps: any) => (
		<View
			style={{
				height: "auto",
				maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.35),
				backgroundColor: Colors.white,
			}}
		>
			<FlatList
				data={listProps.data}
				renderItem={this.renderItem}
				keyExtractor={this.keyExtractor}
				showsVerticalScrollIndicator={true}
				keyboardShouldPersistTaps="handled"
				persistentScrollbar={true}
			/>
		</View>
	);

	renderItem = ({ item }: any) => (
		<TouchableHighlight
			key={item._id}
			activeOpacity={0.5}
			underlayColor={Colors.rippleColor}
			onPress={this.onSelectCountryItem.bind(this, item)}
		>
			<View style={styles.listItem}>
				<View style={{ flexDirection: "row" }}>
					<Image
						source={{ uri: item.flag }}
						resizeMode="cover"
						style={{ height: 20, width: 30 }}
					/>
					<Text style={styles.countryName}>{`${item.name}`}</Text>
				</View>
			</View>
		</TouchableHighlight>
	);

	keyExtractor = (item: any) => item._id;

	getEsimStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case EsimStatus.PENDING:
				icon = faExclamation;
				break;
			case EsimStatus.ACTIVE:
				icon = faCheck;
				break;
			case EsimStatus.REPLACED:
				icon = faArrowRotateLeft;
				break;
			case EsimStatus.CANCELLED:
				icon = faXmark;
				break;
			default:
				break;
		}
		return icon;
	};

	getDataPackageStatusIcon = (status: string): any => {
		let icon = null;
		switch (status) {
			case DataPackageStatus.AVAILABLE:
				icon = faCheck;
				break;
			case DataPackageStatus.DEPLETED:
				icon = faExclamation;
				break;
			case DataPackageStatus.EXPIRED:
				icon = faXmark;
				break;
			default:
				break;
		}
		return icon;
	};

	render = () => {
		return (
			<Container>
				<Header title={this.props.route.params.productName} />
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
					) : this.state.esimData !== null ? (
						<View style={{ flex: 1, width: "100%" }}>
							<ScrollView
								showsVerticalScrollIndicator={false}
								contentContainerStyle={{ padding: 10 }}
							>
								<Card>
									<View style={styles.cardBody}>
										<View
											style={{
												flexDirection: "row",
												justifyContent: "space-between",
											}}
										>
											<View>
												<Text style={styles.lightText}>{"Esim ID"}</Text>
												<Text style={styles.lightText}>
													{this.state.esimData.id}
												</Text>
											</View>
											{this.state.esimData.currentStatus ===
											EsimStatus.PENDING ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																EsimStatusBackgroundColor.PENDING,
															borderColor: EsimStatusBorderColor.PENDING,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	EsimStatusIconBackgroundColor.PENDING,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getEsimStatusIcon(
																this.state.esimData.currentStatus
															)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{EsimStatusText.PENDING}
													</Text>
												</View>
											) : this.state.esimData.currentStatus ===
											  EsimStatus.ACTIVE ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor: EsimStatusBackgroundColor.ACTIVE,
															borderColor: EsimStatusBorderColor.ACTIVE,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	EsimStatusIconBackgroundColor.ACTIVE,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getEsimStatusIcon(
																this.state.esimData.currentStatus
															)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{EsimStatusText.ACTIVE}
													</Text>
												</View>
											) : this.state.esimData.currentStatus ===
											  EsimStatus.REPLACED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																EsimStatusBackgroundColor.REPLACED,
															borderColor: EsimStatusBorderColor.REPLACED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	EsimStatusIconBackgroundColor.REPLACED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getEsimStatusIcon(
																this.state.esimData.currentStatus
															)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{EsimStatusText.REPLACED}
													</Text>
												</View>
											) : this.state.esimData.currentStatus ===
											  EsimStatus.CANCELLED ? (
												<View
													style={[
														styles.statusBox,
														{
															backgroundColor:
																EsimStatusBackgroundColor.CANCELLED,
															borderColor: EsimStatusBorderColor.CANCELLED,
														},
													]}
												>
													<View
														style={[
															styles.statusIconBackground,
															{
																backgroundColor:
																	EsimStatusIconBackgroundColor.CANCELLED,
															},
														]}
													>
														<FontAwesomeIcon
															icon={this.getEsimStatusIcon(
																this.state.esimData.currentStatus
															)}
															size={14}
															color={Colors.white}
														/>
													</View>
													<Text style={[styles.statusText]}>
														{EsimStatusText.CANCELLED}
													</Text>
												</View>
											) : null}
										</View>

										<Text style={[styles.lightText, { marginTop: 15 }]}>
											{"ICCID Number"}
										</Text>
										<Text style={styles.lightText}>
											{this.state.esimData.iccid}
										</Text>
										<Text style={[styles.lightText, { marginTop: 15 }]}>
											{"First Network Activity Time"}
										</Text>
										{this.state.esimData.firstNetworkActivityTime !== null ? (
											<Text style={styles.lightText}>
												{`${moment
													.utc(this.state.esimData.firstNetworkActivityTime)
													.format("YYYY-MM-DD HH:mm")}`}
											</Text>
										) : (
											<Text style={styles.lightText}>{"N/A"}</Text>
										)}

										<View
											style={{
												width: "100%",
												alignItems: "center",
												justifyContent: "center",
												marginTop: 10,
												padding: 5,
											}}
										>
											<Image
												source={{
													uri: getEsimQrImageUrl(
														this.state.esimData.qr.replace(/[\t\n\r]/gm, "")
													),
												}}
												style={{ width: 150, height: 150 }}
											/>
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
															"Scan the QR by printing out or displaying the code on another device to install your eSIM. Make sure your device has a stable internet connection before installing."
														}
													</Text>
												</View>
											</View>
											{/* <Text
												style={[
													styles.lightText,
													{ marginTop: 10, textAlign: "center" },
												]}
											>
												{
													"Scan the QR by printing out or displaying the code on another device to install your eSIM. Make sure your device has a stable internet connection before installing."
												}
											</Text> */}
										</View>
									</View>
								</Card>

								<Card
									style={{ marginTop: 15 }}
									onPress={this.openInstructionLink.bind(
										this,
										this.state.esimData.id
									)}
								>
									<View
										style={[
											styles.cardBody,
											{
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "space-between",
												paddingVertical: 15,
											},
										]}
									>
										<FontAwesomeIcon
											size={18}
											icon={faLink}
											color={Colors.secondary}
											style={{ marginRight: 10 }}
										/>
										<View style={{ flex: 1 }}>
											<Text style={styles.regularText}>
												{"View Instruction"}
											</Text>
										</View>
										<FontAwesomeIcon
											size={18}
											icon={faChevronRight}
											color={Colors.secondary}
											style={{ marginLeft: 10 }}
										/>
									</View>
								</Card>

								{(this.state.esimData.eSimDataUsageSummary || []).map(
									(item: any, index: number) => {
										return (
											<Card style={{ marginTop: 15 }} key={item.orderId}>
												<View style={[styles.cardHeader]}>
													<View
														style={{
															flexDirection: "row",
															justifyContent: "space-between",
														}}
													>
														{/* <View></View> */}
														<View
															style={{
																flexDirection: "row",
																alignItems: "center",
															}}
														>
															<Image
																source={{ uri: item.flag }}
																resizeMode="cover"
																style={{ height: 20, width: 30 }}
															/>
															{/* <Text
															style={styles.regularText}
														>{`${toUpperCaseWord(item.type)} Package`}</Text> */}
															<Text
																style={[
																	styles.boldText,
																	{ fontSize: 16, marginLeft: 8 },
																]}
															>
																{item.name}
															</Text>
														</View>

														{item.dataPackageStatus ===
														DataPackageStatus.AVAILABLE ? (
															<View
																style={[
																	styles.statusBox,
																	{
																		backgroundColor:
																			DataPackageStatusBackgroundColor.AVAILABLE,
																		borderColor:
																			DataPackageStatusBorderColor.AVAILABLE,
																	},
																]}
															>
																<View
																	style={[
																		styles.statusIconBackground,
																		{
																			backgroundColor:
																				DataPackageStatusIconBackgroundColor.AVAILABLE,
																		},
																	]}
																>
																	<FontAwesomeIcon
																		icon={this.getDataPackageStatusIcon(
																			item.dataPackageStatus
																		)}
																		size={14}
																		color={Colors.white}
																	/>
																</View>
																<Text style={[styles.statusText]}>
																	{item.dataPackageStatus}
																</Text>
															</View>
														) : DataPackageStatus.DEPLETED ? (
															<View
																style={[
																	styles.statusBox,
																	{
																		backgroundColor:
																			DataPackageStatusBackgroundColor.DEPLETED,
																		borderColor:
																			DataPackageStatusBorderColor.DEPLETED,
																	},
																]}
															>
																<View
																	style={[
																		styles.statusIconBackground,
																		{
																			backgroundColor:
																				DataPackageStatusIconBackgroundColor.DEPLETED,
																		},
																	]}
																>
																	<FontAwesomeIcon
																		icon={this.getDataPackageStatusIcon(
																			item.dataPackageStatus
																		)}
																		size={14}
																		color={Colors.white}
																	/>
																</View>
																<Text style={[styles.statusText]}>
																	{item.dataPackageStatus}
																</Text>
															</View>
														) : DataPackageStatus.EXPIRED ? (
															<View
																style={[
																	styles.statusBox,
																	{
																		backgroundColor:
																			DataPackageStatusBackgroundColor.EXPIRED,
																		borderColor:
																			DataPackageStatusBorderColor.EXPIRED,
																	},
																]}
															>
																<View
																	style={[
																		styles.statusIconBackground,
																		{
																			backgroundColor:
																				DataPackageStatusIconBackgroundColor.EXPIRED,
																		},
																	]}
																>
																	<FontAwesomeIcon
																		icon={this.getDataPackageStatusIcon(
																			item.dataPackageStatus
																		)}
																		size={14}
																		color={Colors.white}
																	/>
																</View>
																<Text style={[styles.statusText]}>
																	{item.dataPackageStatus}
																</Text>
															</View>
														) : null}
													</View>
													<Text style={styles.regularText}>{`${toUpperCaseWord(
														item.type
													)} Package`}</Text>
												</View>
												<View
													style={[
														styles.cardBody,
														{ flexDirection: "row", padding: 0 },
													]}
												>
													<View
														style={{
															flex: 1,
															borderRightWidth: 1,
															borderRightColor: Colors.lightBorder,
															alignItems: "center",
															justifyContent: "center",
															padding: 10,
														}}
													>
														<AnimatedProgressWheel
															size={120}
															width={12}
															progress={item.usage[0].usageGB}
															max={item.usage[0].quotaGB}
															showProgressLabel={false}
															rotation={"-90deg"}
															color={Colors.secondary}
															backgroundColor={Colors.lightBorder}
														/>
														<View
															style={{
																position: "absolute",
																top: 55,
																alignItems: "center",
																justifyContent: "center",
															}}
														>
															<Text style={styles.regularText}>
																{`${
																	Number(item.usage[0].quotaGB) -
																	Number(item.usage[0].usageGB)
																} GB`}
															</Text>
															<Text style={styles.regularText}>
																{"Remaining"}
															</Text>
														</View>
													</View>
													<View style={{ flex: 1 }}>
														<View
															style={{
																flex: 1,
																padding: 10,
																borderBottomWidth: 1,
																borderBottomColor: Colors.lightBorder,
															}}
														>
															<Text style={styles.regularText}>
																{"Used Data"}
															</Text>
															<Text style={styles.boldText}>
																{`${item.usage[0].usageGB} GB`}
															</Text>
														</View>
														<View
															style={{
																flex: 1,
																padding: 10,
															}}
														>
															<Text style={styles.regularText}>
																{"Total Data"}
															</Text>
															<Text style={styles.boldText}>
																{`${item.usage[0].quotaGB} GB for ${item.days} Days`}
															</Text>
														</View>
													</View>
												</View>
												<View
													style={{
														padding: 10,
														borderTopWidth: 1,
														borderColor: Colors.lightBorder,
													}}
												>
													<View
														style={{
															flexDirection: "row",
															alignItems: "center",
														}}
													>
														<Text style={styles.regularText}>
															{"First Usage On - "}
														</Text>
														{item.firstUsageTime !== null ? (
															<Text style={styles.boldText}>
																{`${moment
																	.utc(item.firstUsageTime)
																	.format("YYYY-MM-DD HH:mm")}`}
															</Text>
														) : (
															<Text style={styles.boldText}>{"N/A"}</Text>
														)}
													</View>
												</View>
											</Card>
										);
									}
								)}

								<Button
									title={"Recharge"}
									onPress={this.openModal}
									style={{ marginTop: 20, marginBottom: 5 }}
								/>
							</ScrollView>
						</View>
					) : null}
				</WhiteContainer>

				<BottomSheet
					isVisible={this.state.isModalOpen}
					title={"Get Quote"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.8) }}
					onClose={this.closeModal}
				>
					<View style={{ padding: 20 }}>
						<Formik
							initialValues={{
								countryName: "",
								countryTxt: "",
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
									<AutoCompleteInput
										label="Country"
										value={values.countryTxt}
										data={this.state.allCountries}
										onChangeText={this.onChangeCountry}
										onClear={this.onClearCountry}
										isSearching={this.state.isSearchingCountry}
										hideResults={this.state.isCountryResultHide}
										error={
											touched.countryName && errors.countryName
												? errors.countryName
												: null
										}
										containerStyle={{ zIndex: 99999 }}
										renderResultList={this.renderResultList}
									/>
									<InputField
										value={`${values.days}`}
										label={"Number of Days"}
										keyboardType="number-pad"
										autoCapitalize="none"
										onChangeText={handleChange("days")}
										onBlur={handleBlur("days")}
										error={touched.days && errors.days ? errors.days : null}
										style={{ marginTop: 15 }}
									/>
									<InputField
										value={values.currencyCode}
										label={"Currency"}
										autoCapitalize="none"
										onChangeText={handleChange("currencyCode")}
										onBlur={handleBlur("currencyCode")}
										editable={false}
										style={{ marginTop: 10 }}
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
		paddingHorizontal: 0,
		paddingTop: 10,
	},
	card: {
		width: Constant.WINDOW_WIDTH - 20,
		padding: 12,
		marginVertical: 10,
		marginHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	cardHeader: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	cardBody: {
		padding: 10,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
		lineHeight: 26,
	},
	regularText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		opacity: 1,
		lineHeight: 18,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	errorText: {
		fontSize: 11,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.danger,
		marginTop: 3,
	},
	listItem: {
		padding: 10,
		borderWidth: 0,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		backgroundColor: Colors.white,
	},
	countryName: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 15,
		fontWeight: "400",
		lineHeight: 20,
		marginLeft: 5,
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
