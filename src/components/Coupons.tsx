import React from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableHighlight,
	TouchableOpacity,
	View,
	Alert,
	Image,
} from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/pro-light-svg-icons/faChevronRight";
import { faBadgePercent } from "@fortawesome/pro-solid-svg-icons/faBadgePercent";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faCircleXmark } from "@fortawesome/pro-solid-svg-icons/faCircleXmark";
import moment from "moment-timezone";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import Button from "./Button";
// import NoResult from "./NoResult";
// import Loader from "./Loader";
// import { getAllCoupons } from "../services/ApiService";
import AppContext from "../context/AppContext";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	coupons: Array<any>;
	appliedCoupons: Array<any>;
	discountApplicable: number;
	onApply: (code: string) => void;
	onDiscard: (code: string) => void;
};

type States = {
	isListOpen: boolean;
};

type FormModel = {
	couponCode: string;
};

const validationSchema = Yup.object().shape({
	couponCode: Yup.string().trim().required("Coupon code is required"),
});

export default class Coupons extends React.Component<Props, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;

	constructor(props: Props) {
		super(props);
		this.state = {
			isListOpen: false,
		};
		this.formikRef = React.createRef();
	}

	openModal = () => {
		this.setState({ isListOpen: true });
	};

	closeModal = () => {
		this.setState({ isListOpen: false });
	};

	onChangeCouponCode = (value: string) => {
		this.formikRef &&
			this.formikRef.current?.setFieldValue(
				"couponCode",
				value.trim().toLocaleUpperCase()
			);
	};

	onApplyCoupon = (values: FormModel) => {
		this.setState({ isListOpen: false }, () => {
			setTimeout(() => {
				const { onApply } = this.props;
				onApply(values.couponCode);
			}, 250);
		});
	};

	onSelectCoupon = (couponCode: string) => {
		this.setState({ isListOpen: false }, () => {
			setTimeout(() => {
				const { onApply } = this.props;
				onApply(couponCode);
			}, 250);
		});
	};

	onRemoveCoupon = (couponCode: string) => {
		Alert.alert("Warning", "Are you sure, you want to remove this coupon?", [
			{
				text: LocalizedText.NO,
				style: "cancel",
			},
			{
				text: LocalizedText.YES,
				onPress: () => {
					const { onDiscard } = this.props;
					onDiscard(couponCode);
				},
			},
		]);
	};

	renderItem = ({ item }: any) => (
		<View style={styles.card}>
			<View style={{ flexDirection: "row", alignItems: "center" }}>
				<View
					style={{
						width: "18%",
						alignItems: "flex-start",
						justifyContent: "center",
					}}
				>
					<FontAwesomeIcon
						icon={faBadgePercent}
						size={40}
						color={Colors.secondary}
					/>
				</View>
				<View style={{ width: "82%" }}>
					<Text style={styles.title}>{item.code}</Text>
					<Text numberOfLines={3} ellipsizeMode="tail" style={styles.desc}>
						{item.description}
					</Text>
				</View>
			</View>

			<View style={styles.line} />

			<View style={styles.footer}>
				<Text style={styles.validTxt}>
					{`${LocalizedText.OFFER_VALID} ${moment
						.utc(item.expired_on)
						.format("Do MMM YYYY")}`}
				</Text>

				<TouchableOpacity
					activeOpacity={1}
					onPress={this.onSelectCoupon.bind(this, item.code)}
					style={styles.btnSm}
				>
					<Text style={styles.btnSmText}>{LocalizedText.APPLY}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<View
			style={{
				marginTop: 35,
				justifyContent: "center",
				alignItems: "center",
				paddingHorizontal: 30,
			}}
		>
			<Image
				source={require("../assets/images/Group-127.png")}
				style={{ width: 200, height: 200 }}
			/>
			<Text
				style={{
					fontFamily: "Roboto-Medium",
					fontWeight: "500",
					fontSize: 30,
					color: Colors.primaryFont,
				}}
			>
				{"Oops!"}
			</Text>
			<Text
				style={{
					marginTop: 10,
					textAlign: "center",
					fontFamily: "Roboto-Regular",
					fontWeight: "400",
					fontSize: 16,
					color: Colors.lightFont,
				}}
			>
				{"Sorry, no coupons found. Keep searching for great deals!"}
			</Text>
		</View>
	);

	render = () => {
		const { appliedCoupons } = this.props;

		return (
			<>
				<TouchableOpacity style={styles.couponBox} onPress={this.openModal}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<FontAwesomeIcon
							size={30}
							icon={faBadgePercent}
							color={Colors.secondary}
						/>

						<View style={{ marginLeft: 10 }}>
							<Text style={styles.couponTxt}>{LocalizedText.APPLY_COUPON}</Text>
							<Text
								style={[
									styles.couponTxt,
									{
										fontSize: 12,
										lineHeight: 18,
										fontFamily: "Roboto-Regular",
										fontWeight: "400",
										opacity: 0.9,
									},
								]}
							>
								{LocalizedText.SAVE_MORE_WITH_COUPONS}
							</Text>
						</View>
					</View>
					<FontAwesomeIcon
						size={18}
						icon={faChevronRight}
						color={Colors.secondaryFont}
					/>
				</TouchableOpacity>

				{appliedCoupons.length > 0 ? (
					<>
						<Text style={[styles.couponTxt, { marginLeft: 15, marginTop: 10 }]}>
							{"Applied Coupons:"}
						</Text>

						<View style={styles.wrapView}>
							{appliedCoupons.map((item: any, index: number) => (
								<View key={item._id} style={styles.chip}>
									<Text style={styles.chipText}>{item.code}</Text>
									<TouchableOpacity
										style={{ padding: 3, marginLeft: 3 }}
										onPress={this.onRemoveCoupon.bind(this, item.code)}
									>
										<FontAwesomeIcon
											size={16}
											icon={faXmark}
											color={Colors.danger}
										/>
									</TouchableOpacity>
								</View>
							))}
						</View>
					</>
				) : null}

				<Modal
					isVisible={this.state.isListOpen}
					statusBarTranslucent={true}
					useNativeDriver={true}
					useNativeDriverForBackdrop={true}
					hideModalContentWhileAnimating={true}
					deviceHeight={Constant.SCREEN_HEIGHT}
					deviceWidth={Constant.SCREEN_WIDTH}
					style={styles.modalOverlay}
					backdropColor={"rgba(0,0,0,0.5)"}
					backdropOpacity={1}
					animationInTiming={350}
					animationOutTiming={200}
					onBackButtonPress={this.closeModal}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalHeader}>
							<Text style={styles.heading}>{LocalizedText.APPLY_COUPON}</Text>
							<TouchableHighlight
								style={{
									position: "absolute",
									right: 8,
									padding: 5,
									borderRadius: 90,
								}}
								onPress={this.closeModal}
								underlayColor={Colors.lightGrey}
							>
								<FontAwesomeIcon
									icon={faXmark}
									size={20}
									color={Colors.mediumGrey}
								/>
							</TouchableHighlight>
						</View>
						<View style={{ width: "100%" }}>
							<Formik
								initialValues={{ couponCode: "" }}
								validationSchema={validationSchema}
								onSubmit={this.onApplyCoupon}
								innerRef={this.formikRef}
							>
								{({ handleSubmit, touched, errors, values }) => (
									<>
										<View
											style={[
												styles.searchBox,
												touched.couponCode && errors.couponCode
													? { borderColor: Colors.danger }
													: null,
											]}
										>
											<View style={{ width: "80%" }}>
												<TextInput
													placeholder={LocalizedText.ENTER_COUPON_CODE}
													placeholderTextColor={Colors.mediumGrey}
													value={values.couponCode}
													onChangeText={this.onChangeCouponCode}
												/>
											</View>

											<TouchableOpacity
												style={{
													width: 70,
													height: 25,
													backgroundColor: "transparent",
													justifyContent: "center",
													alignItems: "center",
												}}
												onPress={() => handleSubmit()}
											>
												<Text
													style={{
														color: Colors.primaryBtn,
														fontSize: 14,
														fontFamily: "Roboto-Medium",
														fontWeight: "500",
														lineHeight: 21,
														opacity: 0.8,
													}}
												>
													{LocalizedText.APPLY}
												</Text>
											</TouchableOpacity>
										</View>
										{touched.couponCode && errors.couponCode ? (
											<Text
												style={[styles.errorText, { marginHorizontal: 10 }]}
											>
												{errors.couponCode}
											</Text>
										) : null}
									</>
								)}
							</Formik>
						</View>
						{this.props.coupons.length > 0 ? (
							<View style={{ marginVertical: 10, marginHorizontal: 10 }}>
								<Text
									style={[
										styles.heading,
										{
											color: Colors.secondaryFont,
											fontSize: 14,
											lineHeight: 21,
										},
									]}
								>
									{LocalizedText.AVAILABLE_COUPONS}
								</Text>
							</View>
						) : null}

						<FlatList
							keyboardShouldPersistTaps="handled"
							data={this.props.coupons}
							renderItem={this.renderItem}
							keyExtractor={this.keyExtractor}
							ListEmptyComponent={this.getListEmptyComponent.bind(this)}
							showsVerticalScrollIndicator={false}
							initialNumToRender={this.props.coupons.length}
						/>
					</View>
				</Modal>
			</>
		);
	};
}

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.9),
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
		fontSize: 16,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	couponBox: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		borderRadius: 12,
		backgroundColor: Colors.secondaryAlpha2,
		marginVertical: 10,
		marginHorizontal: 15,
	},
	couponTxt: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 21,
		color: Colors.primaryFont,
	},
	searchBox: {
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 6,
		height: 45,
		paddingHorizontal: 10,
		marginHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	card: {
		padding: 10,
		elevation: 6,
		borderRadius: 12,
		backgroundColor: Colors.white,
		marginVertical: 10,
		marginHorizontal: 10,
	},
	title: {
		fontSize: 16,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
	},
	desc: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		lineHeight: 18,
		opacity: 0.9,
	},
	line: {
		backgroundColor: Colors.lightGrey,
		marginVertical: 10,
		height: 1,
	},
	footer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	validTxt: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
	},
	btnSm: {
		width: 62,
		minHeight: 30,
		borderRadius: 90,
		backgroundColor: Colors.primaryBtn,
		alignItems: "center",
		justifyContent: "center",
	},
	btnSmText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.white,
	},
	wrapView: {
		width: "100%",
		paddingVertical: 10,
		paddingHorizontal: 10,
		flexDirection: "row",
		flexWrap: "wrap",
	},
	chip: {
		minWidth: 60,
		paddingLeft: 10,
		paddingRight: 5,
		paddingVertical: 3,
		borderRadius: 25,
		marginHorizontal: 5,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.mediumGrey,
	},
	chipText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
});
