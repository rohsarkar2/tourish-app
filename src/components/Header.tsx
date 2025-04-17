import React, { useContext } from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	Image,
	ViewStyle,
	Alert,
} from "react-native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-regular-svg-icons/faArrowLeft";
import { faPenToSquare } from "@fortawesome/pro-light-svg-icons/faPenToSquare";
import { faTrashCan } from "@fortawesome/pro-light-svg-icons/faTrashCan";
import { faCartShopping } from "@fortawesome/pro-light-svg-icons/faCartShopping";
import { faBagShopping } from "@fortawesome/pro-light-svg-icons/faBagShopping";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";
import {
	RootStackParamList,
	BottomTabParamList,
} from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import WishlistContext from "../context/WishlistContext";

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 10,
		height: 50,
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 15,
		backgroundColor: Colors.primaryBg,
	},
	headerLeft: {
		width: "15%",
		height: "100%",
		alignItems: "flex-start",
		justifyContent: "flex-end",
	},
	headerMiddle: {
		width: "65%",
		height: "100%",
		alignItems: "center",
		justifyContent: "flex-end",
	},
	headerRight: {
		width: "20%",
		height: "100%",
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "flex-end",
	},
	title: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 20,
		color: Colors.white,
		lineHeight: 24,
		marginBottom: 3,
	},
	badge: {
		position: "absolute",
		top: -2,
		right: 0,
		height: 16,
		width: 16,
		padding: 2,
		backgroundColor: "red",
		borderRadius: 100,
		justifyContent: "center",
	},
	badgeText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 9,
		color: Colors.white,
		textAlign: "center",
	},
	wishlistBadge: {
		position: "absolute",
		bottom: -2,
		right: 0,
		height: 16,
		width: 16,
		padding: 2,
		backgroundColor: "red",
		borderRadius: 100,
		justifyContent: "center",
	},
});

type Props = {
	title?: string;
	style?: ViewStyle;
	onBackAction?: () => void;
	onEditTour?: () => void;
	onDeleteTour?: () => void;
};

const Header: React.FC<Props> = (props) => {
	const context = useContext(AppContext);
	const context2 = useContext(WishlistContext);
	const navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	> = useNavigation();
	const route = useRoute();

	const canGoBack: boolean = !["Home", "Journey", "Account"].includes(
		route.name
	);

	const gotoBack = () => (canGoBack ? navigation.goBack() : undefined);

	const gotoCart = () => {
		if (context.userData !== null) {
			navigation.navigate("Cart");
		} else {
			Alert.alert(
				LocalizedText.SIGN_IN_TO_CONTINUE,
				LocalizedText.SIGN_IN_REQUIRED_MESSAGE,
				[
					{ text: LocalizedText.CLOSE, style: "cancel" },
					{
						text: LocalizedText.SIGN_IN,
						onPress: () => {
							navigation.navigate("SignIn");
						},
					},
				]
			);
		}
	};

	const gotoWishlist = () => {
		navigation.navigate("Wishlist");
	};

	return (
		<View style={[styles.container, props.style]}>
			<TouchableOpacity
				activeOpacity={0.5}
				style={[styles.headerLeft, { paddingLeft: 5 }]}
				onPress={
					canGoBack
						? props.onBackAction
							? props.onBackAction
							: gotoBack
						: undefined
				}
			>
				{canGoBack ? (
					<FontAwesomeIcon
						size={25}
						icon={faArrowLeft}
						color={Colors.white}
						style={{ marginBottom: 2 }}
					/>
				) : null}
			</TouchableOpacity>

			<View
				style={[
					styles.headerMiddle,
					canGoBack ? { alignItems: "flex-start" } : null,
					route.name === "Home"
						? { alignItems: "center", justifyContent: "center" }
						: null,
				]}
			>
				{route.name === "Home" ? (
					<Image
						source={require("../assets/images/tourish-white-logo.png")}
						style={{
							height: 45,
							width: 120,
							marginBottom: 0,
							alignSelf: "center",
						}}
						resizeMode="contain"
					/>
				) : (
					<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
						{props.title || route.name}
					</Text>
				)}
			</View>

			<View
				// style={styles.headerRight}
				style={[
					styles.headerRight,
					route.name === "Home" ? { alignItems: "center" } : null,
				]}
			>
				{route.name === "JourneyDetails" ? (
					<>
						<TouchableOpacity
							activeOpacity={0.5}
							style={{ padding: 5, borderRadius: 100 }}
							onPress={props.onEditTour}
						>
							<FontAwesomeIcon
								size={18}
								icon={faPenToSquare}
								color={Colors.white}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							activeOpacity={0.5}
							style={{ padding: 5, borderRadius: 100 }}
							onPress={props.onDeleteTour}
						>
							<FontAwesomeIcon
								size={18}
								icon={faTrashCan}
								color={Colors.white}
							/>
						</TouchableOpacity>
					</>
				) : null}

				{["Home", "TimeSlots", "SimtexQuotation"].includes(route.name) ? (
					<TouchableOpacity
						style={{ padding: 5, borderRadius: 100 }}
						onPress={gotoCart}
					>
						<FontAwesomeIcon
							size={22}
							icon={faCartShopping}
							color={Colors.white}
						/>
						{context.userData !== null &&
						Number(context.userData.total_cart_items) > 0 ? (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>
									{context.userData.total_cart_items}
								</Text>
							</View>
						) : null}
					</TouchableOpacity>
				) : null}

				{["DutyFreeProducts", "DutyFreeProductDetails"].includes(route.name) ? (
					<TouchableOpacity
						style={{ padding: 5, borderRadius: 100 }}
						onPress={gotoWishlist}
					>
						<FontAwesomeIcon
							size={22}
							icon={faBagShopping}
							color={Colors.white}
						/>
						{context2.wishlist.length > 0 ? (
							<View style={styles.wishlistBadge}>
								<Text style={styles.badgeText}>{context2.wishlist.length}</Text>
							</View>
						) : null}
					</TouchableOpacity>
				) : null}
			</View>
		</View>
	);
};

export default Header;
