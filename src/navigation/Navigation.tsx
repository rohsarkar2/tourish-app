import React, { Fragment, useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
import {
	NavigationContainer,
	CompositeNavigationProp,
	CommonActions,
	useNavigation,
} from "@react-navigation/native";
import {
	createStackNavigator,
	CardStyleInterpolators,
	StackNavigationProp,
} from "@react-navigation/stack";
import messaging from "@react-native-firebase/messaging";
import ReceiveSharingIntent from "react-native-receive-sharing-intent";
import {
	createBottomTabNavigator,
	BottomTabNavigationProp,
} from "@react-navigation/bottom-tabs";
import notifee, { EventType } from "@notifee/react-native";
import { RootStackParamList, BottomTabParamList } from "./NavigationTypes";
import Colors from "../configs/Colors";
import NotificationType from "../configs/NotificationType";
import SignIn from "../screens/SignIn";
import SignUp from "../screens/SignUp";
import ForgotPassword from "../screens/ForgotPassword";
import Home from "../screens/Home";
import Journey from "../screens/Journey";
import Account from "../screens/Account";
import Explore from "../screens/Explore";
import LowSeasonTravellerProductList from "../screens/product-list/LowSeasonTravellerProductList";
import CarRentalProductList from "../screens/product-list/CarRentalProductList";
import EsimProductList from "../screens/product-list/EsimProductList";
import CarRentalAirportTransfer from "../screens/product-details/CarRentalAirportTransfer";
import SimtexQuotation from "../screens/product-details/SimtexQuotation";
import MeetAndGreetProductList from "../screens/product-list/MeetAndGreetProductList";
import MobilityAssistProductList from "../screens/product-list/MobilityAssistProductList";
import PorterProductList from "../screens/product-list/PorterProductList";
import LoungeProductList from "../screens/product-list/LoungeProductList";
import MeetAndGreet from "../screens/product-details/MeetAndGreet";
import MobilityAssist from "../screens/product-details/MobilityAssist";
import Porter from "../screens/product-details/Porter";
import Lounge from "../screens/product-details/Lounge";
import TimeSlots from "../screens/product-details/TimeSlots";
import JourneyEsimDetails from "../screens/product-details/JourneyEsimDetails";
import JourneyDetails from "../screens/JourneyDetails";
import MyDocuments from "../screens/MyDocuments";
import EditProfile from "../screens/EditProfile";
import ChangePassword from "../screens/ChangePassword";
import DeleteAccount from "../screens/DeleteAccount";
import AirportInfo from "../screens/AirportInfo";
import ManageCabActivity from "../screens/ManageCabActivity";
import ManageEventActivity from "../screens/ManageEventActivity";
import ManageFlightActivity from "../screens/ManageFlightActivity";
import ManageHotelActivity from "../screens/ManageHotelActivity";
import { BottomTab } from "../components";
import MyBookings from "../screens/MyBookings";
import BookingDetails from "../screens/BookingDetails";
import Cart from "../screens/Cart";
import MyOrders from "../screens/MyOrders";
import OrderDetails from "../screens/OrderDetails";
import Payment from "../screens/Payment";
import Reschedule from "../screens/Reschedule";
import DutyFreeShopList from "../screens/product-list/DutyFreeShopList";
import DutyFreeShopDetails from "../screens/product-details/DutyFreeShopDetails";
import DutyFreeProducts from "../screens/product-list/DutyFreeProducts";
import DutyFreeProductDetails from "../screens/product-details/DutyFreeProductDetails";
import Wishlist from "../screens/Wishlist";
import Prebook from "../screens/Prebook";
import PrebookSuccess from "../screens/PrebookSuccess";
import LowSeasonDestinationList from "../screens/product-list/LowSeasonDestinationList";
import LowSeasonDestination from "../screens/product-details/LowSeasonDestination";
import ManageFlightSearch from "../screens/ManageFlightSearch";
import TopUpPayment from "../screens/TopUpPayment";
import EsimList from "../screens/EsimList";
import DocumentFolder from "../screens/DocumentFolder";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const HomeTab = () => {
	const navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	> = useNavigation();

	useEffect(() => {
		messaging().onNotificationOpenedApp((message: any) => {
			const { data } = message;
			if (data?.type === NotificationType.BOOKING) {
				navigation.navigate("MyBookings");
			} else if (data?.type === NotificationType.ORDER) {
				navigation.navigate("MyOrders");
			} else {
			}
		});
	}, []);

	useEffect(() => {
		const unsubscribe = notifee.onForegroundEvent(({ type, detail }: any) => {
			switch (type) {
				case EventType.DISMISSED:
					break;
				case EventType.PRESS:
					if (detail.notification?.data?.type === NotificationType.BOOKING) {
						navigation.navigate("MyBookings");
					} else if (
						detail.notification?.data?.type === NotificationType.ORDER
					) {
						navigation.navigate("MyOrders");
					} else {
					}
					break;
				default:
					break;
			}
		});
		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		ReceiveSharingIntent.getReceivedFiles(
			(files: any) => {
				if (files && files.length > 0) {
					const sharedFiles: any = files;

					navigation.dispatch(
						CommonActions.reset({
							index: 0,
							routes: [
								{
									name: "HomeTab",
									params: { screen: "Account" },
								},
								{
									name: "MyDocuments",
									params: { sharedFiles: sharedFiles, type: "ExternalUpload" },
								},
							],
						})
					);
				}
			},
			(error: any) => {},
			"ShareMedia"
		);

		return () => {
			ReceiveSharingIntent.clearReceivedFiles();
		};
	}, []);

	return (
		<Tab.Navigator
			initialRouteName={"Home"}
			backBehavior="none"
			tabBar={(props) => <BottomTab {...props} />}
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarShowLabel: false,
				tabBarHideOnKeyboard: true,
				tabBarActiveTintColor: Colors.primary,
				tabBarInactiveTintColor: Colors.mediumGrey,
				tabBarActiveBackgroundColor: Colors.white,
				tabBarInactiveBackgroundColor: Colors.white,
			})}
		>
			<Tab.Screen name="Home" component={Home} />
			<Tab.Screen name="Journey" component={Journey} />
			<Tab.Screen name="Account" component={Account} />
		</Tab.Navigator>
	);
};

const StackNav = () => {
	const [isLoading, setLoading] = useState(true);
	const [initialRoute, setInitialRoute] =
		useState<keyof RootStackParamList>("HomeTab");

	useEffect(() => {
		messaging()
			.getInitialNotification()
			.then((message: any) => {
				if (message) {
					const { data } = message;
					if (data?.type === NotificationType.BOOKING) {
						setInitialRoute("MyBookings");
					} else if (data?.type === NotificationType.ORDER) {
						setInitialRoute("MyOrders");
					} else {
					}
				}
				setLoading(false);
			});
	}, []);

	return isLoading ? null : (
		<Fragment>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					presentation: "transparentModal",
					detachPreviousScreen: true,
					cardShadowEnabled: false,
					cardOverlayEnabled: false,
					cardStyle: { backgroundColor: "transparent" },
					cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
				}}
			>
				<Stack.Screen name="HomeTab" component={HomeTab} />
				<Stack.Screen name="Explore" component={Explore} />
				<Stack.Screen
					name="LowSeasonTravellerProductList"
					component={LowSeasonTravellerProductList}
				/>
				<Stack.Screen
					name="LowSeasonDestinationList"
					component={LowSeasonDestinationList}
				/>
				<Stack.Screen
					name="LowSeasonDestination"
					component={LowSeasonDestination}
				/>
				<Stack.Screen
					name="CarRentalProductList"
					component={CarRentalProductList}
				/>
				<Stack.Screen name="EsimProductList" component={EsimProductList} />
				<Stack.Screen
					name="CarRentalAirportTransfer"
					component={CarRentalAirportTransfer}
				/>
				<Stack.Screen name="SimtexQuotation" component={SimtexQuotation} />
				<Stack.Screen
					name="MeetAndGreetProductList"
					component={MeetAndGreetProductList}
				/>
				<Stack.Screen
					name="MobilityAssistProductList"
					component={MobilityAssistProductList}
				/>
				<Stack.Screen name="PorterProductList" component={PorterProductList} />
				<Stack.Screen name="LoungeProductList" component={LoungeProductList} />
				<Stack.Screen name="MeetAndGreet" component={MeetAndGreet} />
				<Stack.Screen name="MobilityAssist" component={MobilityAssist} />
				<Stack.Screen name="Porter" component={Porter} />
				<Stack.Screen name="Lounge" component={Lounge} />
				<Stack.Screen name="TimeSlots" component={TimeSlots} />
				<Stack.Screen
					name="JourneyEsimDetails"
					component={JourneyEsimDetails}
				/>
				<Stack.Screen name="AirportInfo" component={AirportInfo} />
				<Stack.Screen name="MyDocuments" component={MyDocuments} />
				<Stack.Screen name="EditProfile" component={EditProfile} />
				<Stack.Screen name="ChangePassword" component={ChangePassword} />
				<Stack.Screen
					name="JourneyDetails"
					component={JourneyDetails}
					initialParams={{ tabIndex: 1 }}
				/>
				<Stack.Screen name="DeleteAccount" component={DeleteAccount} />
				<Stack.Screen name="ManageCabActivity" component={ManageCabActivity} />
				<Stack.Screen
					name="ManageEventActivity"
					component={ManageEventActivity}
				/>
				<Stack.Screen
					name="ManageFlightActivity"
					component={ManageFlightActivity}
				/>
				<Stack.Screen
					name="ManageHotelActivity"
					component={ManageHotelActivity}
				/>
				<Stack.Screen name="DutyFreeShopList" component={DutyFreeShopList} />
				<Stack.Screen
					name="DutyFreeShopDetails"
					component={DutyFreeShopDetails}
				/>
				<Stack.Screen name="DutyFreeProducts" component={DutyFreeProducts} />
				<Stack.Screen
					name="DutyFreeProductDetails"
					component={DutyFreeProductDetails}
				/>
				<Stack.Screen
					name="ManageFlightSearch"
					component={ManageFlightSearch}
				/>
				<Stack.Screen name="DocumentFolder" component={DocumentFolder} />
				<Stack.Screen name="Wishlist" component={Wishlist} />
				<Stack.Screen name="Prebook" component={Prebook} />
				<Stack.Screen name="PrebookSuccess" component={PrebookSuccess} />
				<Stack.Screen name="MyBookings" component={MyBookings} />
				<Stack.Screen name="BookingDetails" component={BookingDetails} />
				<Stack.Screen name="Reschedule" component={Reschedule} />
				<Stack.Screen name="Cart" component={Cart} />
				<Stack.Screen name="MyOrders" component={MyOrders} />
				<Stack.Screen name="OrderDetails" component={OrderDetails} />
				<Stack.Screen name="EsimList" component={EsimList} />
				<Stack.Screen name="Payment" component={Payment} />
				<Stack.Screen name="TopUpPayment" component={TopUpPayment} />
				<Stack.Screen name="SignIn" component={SignIn} />
				<Stack.Screen name="SignUp" component={SignUp} />
				<Stack.Screen name="ForgotPassword" component={ForgotPassword} />
			</Stack.Navigator>
			<SafeAreaView style={{ flex: 0, backgroundColor: Colors.white }} />
		</Fragment>
	);
};

const Navigation: React.FC<any> = (props) => {
	return (
		<NavigationContainer>
			<StackNav />
		</NavigationContainer>
	);
};

export default Navigation;
