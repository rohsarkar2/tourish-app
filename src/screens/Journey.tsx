import React from "react";
import {
	StyleSheet,
	Text,
	View,
	FlatList,
	TouchableOpacity,
	Keyboard,
	Alert,
	BackHandler,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-regular-svg-icons/faPlus";
import moment from "moment-timezone";
import {
	Container,
	WhiteContainer,
	Header,
	ListAvatar,
	ListFooter,
	NoResult,
	Button,
	OverlayLoader,
	Loader,
	BottomSheet,
	Card,
	SignInRequired,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import TourBookService from "../services/TourBookService";
import { JourneyScreenProps } from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import { CommonActions } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	journeyName: Yup.string().required(LocalizedText.ENTER_TOUR_BOOK_TITLE),
});

type States = {
	page: number;
	journeyItems: any[];
	totalRecords: number;
	isLoading: boolean;
	isRefresing: boolean;
	isLoadMore: boolean;
	isModalOpen: boolean;
	isValidationFailed: boolean;
	isSubmitting: boolean;
};

export default class Journey extends React.Component<
	JourneyScreenProps,
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
			journeyItems: [],
			totalRecords: 0,
			isLoading: true,
			isRefresing: false,
			isLoadMore: false,
			isModalOpen: false,
			isValidationFailed: false,
			isSubmitting: false,
		};
	}

	componentDidMount = () => {
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.onBackButtonPress
		);

		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	onFocusScreen = () => {
		const { userData } = this.context;
		if (userData !== null) {
			this.setState(
				{
					page: 1,
					journeyItems: [],
					totalRecords: 0,
					isLoading: true,
					isRefresing: false,
					isLoadMore: false,
				},
				() => {
					this.fetchJourneyItems();
				}
			);
		} else {
			this.setState({
				page: 1,
				journeyItems: [],
				totalRecords: 0,
				isLoading: false,
				isRefresing: false,
				isLoadMore: false,
			});
		}
	};

	componentWillUnmount = () => {
		this.backHandler.remove();
		this.focusListner();
	};

	onBackButtonPress = () => {
		this.props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: "HomeTab",
						params: { screen: "Home" },
					},
				],
			})
		);
		return true;
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true, page: 1 }, () => {
			this.fetchJourneyItems();
		});
	};

	handelLoadMore = () => {
		this.setState({ isLoadMore: true, page: this.state.page + 1 }, () => {
			this.fetchJourneyItems();
		});
	};

	fetchJourneyItems = () => {
		let reqData = {
			page: this.state.page,
			limit: Constant.DEFAULT_LIMIT,
		};

		TourBookService.getAll(reqData)
			.then((response) => {
				if (response.check === true) {
					const { journeyItems, isRefresing } = this.state;
					const data = response.data;

					this.setState({
						journeyItems: isRefresing ? data : [...journeyItems, ...data],
						totalRecords: parseInt(response.count),
						isLoading: false,
						isRefresing: false,
					});
				} else {
					this.setState({
						page: 1,
						journeyItems: [],
						totalRecords: 0,
						isLoading: false,
						isRefresing: false,
						isLoadMore: false,
					});
				}
			})
			.catch((error) => {
				this.setState({
					isLoading: false,
					isRefresing: false,
					isLoadMore: false,
				});
			});
	};

	gotoJourneyDetails = (item: any) => {
		this.props.navigation.navigate("JourneyDetails", {
			journeyID: item._id,
			journeyTitle: item.name,
			tabIndex: 1,
		});
	};

	renderItem = ({ item }: any) => {
		return (
			<Card
				style={styles.card}
				onPress={this.gotoJourneyDetails.bind(this, item)}
			>
				<>
					<View style={{ width: "20%" }}>
						<ListAvatar>
							<Text style={[styles.boldText, { color: Colors.white }]}>
								{item.name.charAt(0)}
							</Text>
						</ListAvatar>
					</View>
					<View style={{ width: "80%" }}>
						<Text style={[styles.boldText, { textAlign: "left" }]}>
							{item.name}
						</Text>
						<Text style={[styles.lightText, { textAlign: "left" }]}>
							{moment(item.createdOn).format("D MMMM, YYYY")}
						</Text>
					</View>
				</>
			</Card>
		);
	};

	keyExtractor = (item: any) => item._id;

	render = () => {
		const { journeyItems, totalRecords } = this.state;
		const isListEnd = journeyItems.length >= totalRecords;

		return (
			<Container>
				<Header
					title={LocalizedText.MY_TOUR_BOOKS}
					onBackAction={this.onBackButtonPress}
				/>
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						//
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
												height={8}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={90}
												height={8}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={8}
												borderRadius={3}
												marginBottom={6}
											/>
											<SkeletonPlaceholder.Item
												width={150}
												height={8}
												borderRadius={3}
											/>
										</SkeletonPlaceholder.Item>
									</SkeletonPlaceholder>
								</View>
							))}
						</>
					) : (
						<FlatList
							data={this.state.journeyItems}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							initialNumToRender={Constant.DEFAULT_LIMIT}
							refreshing={this.state.isRefresing}
							onRefresh={this.handelRefresh}
							onEndReached={isListEnd ? undefined : this.handelLoadMore}
							ListHeaderComponent={this.getListHeaderComponent.bind(this)}
							ListFooterComponent={this.getListFooterComponent.bind(this)}
							ListEmptyComponent={this.getListEmptyComponent.bind(this)}
							showsVerticalScrollIndicator={false}
							keyboardShouldPersistTaps={"handled"}
							contentContainerStyle={
								this.state.journeyItems.length <= 0 ? { flex: 1 } : null
							}
						/>
					)}
				</WhiteContainer>

				<BottomSheet
					isVisible={this.state.isModalOpen}
					title={LocalizedText.CREATE_NEW_TOUR_BOOK}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.closeModal}
				>
					<View style={styles.modalBody}>
						<Formik
							initialValues={{ journeyName: "" }}
							validationSchema={validationSchema}
							onSubmit={this.onSubmit}
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
										value={values.journeyName}
										label={LocalizedText.TOUR_BOOK_TITLE}
										autoCapitalize="words"
										onChangeText={handleChange("journeyName")}
										onBlur={handleBlur("journeyName")}
										error={touched.journeyName ? errors.journeyName : null}
									/>

									<Button
										title={LocalizedText.SUBMIT}
										style={styles.submitBtn}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</View>
				</BottomSheet>

				<OverlayLoader visible={this.state.isSubmitting} />
			</Container>
		);
	};

	getListHeaderComponent = () => {
		const { userData } = this.context;
		return userData !== null ? (
			<TouchableOpacity
				activeOpacity={1}
				style={styles.addBtn}
				onPress={this.openModal}
			>
				<FontAwesomeIcon size={18} icon={faPlus} color={Colors.primaryBtn} />
				<Text style={styles.addBtnText}>{LocalizedText.NEW_TOUR_BOOK}</Text>
			</TouchableOpacity>
		) : null;
	};

	getListFooterComponent = () => {
		const { journeyItems, totalRecords } = this.state;
		return <ListFooter isLoadMore={totalRecords > journeyItems.length} />;
	};

	getListEmptyComponent = () => {
		const { userData } = this.context;
		return userData === null ? (
			<SignInRequired />
		) : (
			<NoResult
				title={LocalizedText.NO_RESULR_FOUND}
				// style={{ flex: 0.6 }}
				titleStyle={{ fontSize: 16 }}
			/>
		);
	};

	openModal = () => {
		this.setState({ isModalOpen: true });
	};

	closeModal = () => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false });
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: any) => {
		Keyboard.dismiss();
		this.setState({ isSubmitting: true }, () => {
			const { userData } = this.context;
			const reqData = {
				name: values.journeyName,
				customer_id: userData?._id,
			};

			TourBookService.create(reqData)
				.then((response) => {
					this.setState({ isSubmitting: false }, () => {
						if (response.check === true) {
							let itemsArr = this.state.journeyItems;
							itemsArr.unshift(response.data);

							this.setState({
								isModalOpen: false,
								journeyItems: itemsArr,
							});
						} else {
							Alert.alert(LocalizedText.FAILED, response.message);
						}
					});
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 10,
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
	addBtn: {
		flexDirection: "row",
		alignSelf: "center",
		alignItems: "center",
		justifyContent: "center",
		height: 35,
		width: Constant.WINDOW_WIDTH - 70,
		backgroundColor: Colors.white,
		borderWidth: 1,
		borderColor: Colors.primaryBtn,
		marginHorizontal: 20,
		marginVertical: 10,
		borderRadius: 30,
		borderStyle: "dashed",
	},
	addBtnText: {
		fontSize: 14,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryBtn,
		marginLeft: 5,
	},
	card: {
		width: Constant.WINDOW_WIDTH - 20,
		padding: 12,
		marginVertical: 10,
		marginHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	boldText: {
		fontSize: 18,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
		lineHeight: 26,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.7),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	modalBody: {
		padding: 20,
	},
	submitBtn: {
		marginTop: 30,
		width: "100%",
	},
});
