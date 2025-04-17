import {
	NavigatorScreenParams,
	CompositeScreenProps,
} from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type BottomTabParamList = {
	Home: undefined;
	Journey: undefined;
	Account: undefined;
};

export type RootStackParamList = {
	HomeTab: NavigatorScreenParams<BottomTabParamList>;
	SignIn: undefined;
	SignUp: undefined;
	ForgotPassword: undefined;
	Explore: undefined;
	LowSeasonTravellerProductList: undefined;
	CarRentalProductList: undefined;
	EsimProductList: undefined;
	MeetAndGreetProductList: undefined;
	MobilityAssistProductList: undefined;
	PorterProductList: undefined;
	LoungeProductList: undefined;

	CarRentalAirportTransfer: {
		productId: string;
		productName: string;
	};
	SimtexQuotation: {
		country: string;
		days: number;
		currency: string;
		productId?: string;
		productName?: string;
		esimId?: string;
		type?: string;
	};
	MeetAndGreet: {
		productId: string;
		productName: string;
	};
	MobilityAssist: {
		productId: string;
		productName: string;
	};
	Porter: {
		productId: string;
		productName: string;
	};
	Lounge: {
		productId: string;
		productName: string;
	};
	TimeSlots: {
		productId: string;
		productName: string;
		startDate: string;
		endtDate: string;
		sellEndDate: string;
		sellEndTime: string;
		minimumBookingHour: string;
	};
	JourneyDetails: {
		journeyID: string;
		journeyTitle: string;
		tabIndex: number;
	};
	EditProfile: undefined;
	MyDocuments:
		| undefined
		| {
				journey_id?: string;
				type?: string;
				activityId?: string;
				sharedFiles?: any;
		  };
	ChangePassword: undefined;
	DeleteAccount: undefined;
	AirportInfo: {
		airportId: string;
		isOnBoard: boolean;
	};
	ManageCabActivity: {
		journeyId: string;
		cityId: string;
		cityName: string;
		activityName: string;
		activitySlug: string;
		activityId?: string;
		serviceProvider?: string;
		date?: string;
		time?: null | string;
	};
	ManageEventActivity: {
		journeyId: string;
		cityId: string;
		cityName: string;
		activityName: string;
		activitySlug: string;
		activityId?: string;
		eventName?: string;
		eventLocation?: string;
		eventDate?: string;
		eventTime?: null | string;
	};
	ManageFlightActivity: {
		journeyId: string;
		cityId: string;
		cityName: string;
		activityName: string;
		activitySlug: string;
		activityId?: string;
		origin?: {
			_id: string;
			name: string;
			iataCode: string;
		};
		destination?: {
			_id: string;
			name: string;
			iataCode: string;
		};
		departureDate?: string;
		departureTime?: string;
		arrivalTime?: null | string;
		airlineName?: null | string;
		flightNo?: null | string;
	};
	ManageHotelActivity: {
		journeyId: string;
		cityId: string;
		cityName: string;
		activityName: string;
		activitySlug: string;
		activityId?: string;
		hotelName?: string;
		checkInDate?: string;
		checkInTime?: null | string;
		checkOutDate?: string;
	};
	JourneyEsimDetails: {
		productId: string;
		productName: string;
		esimId: string;
	};
	MyBookings: undefined;
	BookingDetails: { bookingId: string; bookingNo: string };
	Cart: undefined;
	Payment: {
		orderAmount: number;
		currency: string;
		cartId?: string;
		productId?: string;
		bookingId?: string;
		bookingNo?: string;
		quoteId?: string;
		planId?: string;
		slotId?: string;
		capacity?: number;
		date?: string;
	};
	TopUpPayment: {
		orderAmount: number;
		orderCurrency: string;
		quoteId?: string;
		planId: string;
		esimId?: string;
		productId?: string;
		productName?: string;
	};
	MyOrders: undefined;
	EsimList: undefined;
	OrderDetails: {
		orderId: string;
		orderNo: string;
		orderItemId: string;
	};
	Reschedule: {
		orderId: string;
		orderNumber: string;
		category: string;
		timeZone: string;
		minBookingHour: string;
		orderItemId: string;
		bookingDateTime: string;
		startTime: string;
		productEndTime: string;
		productStartTime: string;
	};
	DutyFreeShopList: undefined;
	DutyFreeShopDetails: {
		shopName: string;
		airportName: string;
		airportIATACode: string;
	};
	DutyFreeProducts: {
		name: string;
		allProducts: any;
	};
	DutyFreeProductDetails: {
		productItem: any;
		itemType: string;
		itemId: string;
	};
	Wishlist: undefined;
	Prebook: { amount: number };
	PrebookSuccess: { amount: number };
	LowSeasonDestinationList: undefined;
	LowSeasonDestination: { productId: string; productName: string };
	ManageFlightSearch: {
		journeyId: string;
		activityName: string;
		activitySlug: string;
		flightCode?: null | string;
		date?: null | string;
		flightNo?: null | string;
		activityId?: string;
	};
	DocumentFolder: {
		folderId: string;
		folderName: string;
		type?: string;
		journeyId?: string;
		activityId?: string;
	};
};

export type SignInScreenProps = StackScreenProps<RootStackParamList, "SignIn">;

export type SignUpScreenProps = StackScreenProps<RootStackParamList, "SignUp">;

export type ForgotPasswordScreenProps = StackScreenProps<
	RootStackParamList,
	"ForgotPassword"
>;

export type HomeScreenProps = CompositeScreenProps<
	BottomTabScreenProps<BottomTabParamList, "Home">,
	StackScreenProps<RootStackParamList>
>;

export type JourneyScreenProps = CompositeScreenProps<
	BottomTabScreenProps<BottomTabParamList, "Journey">,
	StackScreenProps<RootStackParamList>
>;

export type AccountScreenProps = CompositeScreenProps<
	BottomTabScreenProps<BottomTabParamList, "Account">,
	StackScreenProps<RootStackParamList>
>;

export type EditProfileScreenProps = StackScreenProps<
	RootStackParamList,
	"EditProfile"
>;

export type MyDocumentScreenProps = StackScreenProps<
	RootStackParamList,
	"MyDocuments"
>;

export type JourneyDetailsScreenProps = CompositeScreenProps<
	StackScreenProps<RootStackParamList, "JourneyDetails">,
	BottomTabScreenProps<BottomTabParamList>
>;

export type ChangePasswordScreenProps = CompositeScreenProps<
	StackScreenProps<RootStackParamList, "ChangePassword">,
	BottomTabScreenProps<BottomTabParamList>
>;

export type DeleteAccountScreenProps = CompositeScreenProps<
	StackScreenProps<RootStackParamList, "DeleteAccount">,
	BottomTabScreenProps<BottomTabParamList>
>;

export type ExploreScreenProps = StackScreenProps<
	RootStackParamList,
	"Explore"
>;

export type LowSeasonTravellerProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"LowSeasonTravellerProductList"
>;

export type CarRentalProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"CarRentalProductList"
>;

export type EsimProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"EsimProductList"
>;

export type MeetAndGreetListScreenProps = StackScreenProps<
	RootStackParamList,
	"MeetAndGreetProductList"
>;

export type MobilityAssistProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"MobilityAssistProductList"
>;

export type PorterProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"PorterProductList"
>;

export type LoungeProductListScreenProps = StackScreenProps<
	RootStackParamList,
	"LoungeProductList"
>;

export type CarRentalAirportTransferScreenProps = StackScreenProps<
	RootStackParamList,
	"CarRentalAirportTransfer"
>;

export type SimtexQuotationScreenProps = StackScreenProps<
	RootStackParamList,
	"SimtexQuotation"
>;

export type MeetAndGreetScreenProps = StackScreenProps<
	RootStackParamList,
	"MeetAndGreet"
>;

export type MobilityAssistScreenProps = StackScreenProps<
	RootStackParamList,
	"MobilityAssist"
>;

export type PorterScreenProps = StackScreenProps<RootStackParamList, "Porter">;

export type LoungeScreenProps = StackScreenProps<RootStackParamList, "Lounge">;

export type TimeSlotsScreenProps = StackScreenProps<
	RootStackParamList,
	"TimeSlots"
>;

export type AirportInfoScreenProps = StackScreenProps<
	RootStackParamList,
	"AirportInfo"
>;

export type CabActivityScreenProps = StackScreenProps<
	RootStackParamList,
	"ManageCabActivity"
>;

export type EventActivityScreenProps = StackScreenProps<
	RootStackParamList,
	"ManageEventActivity"
>;

export type FlightActivityScreenProps = StackScreenProps<
	RootStackParamList,
	"ManageFlightActivity"
>;

export type HotelActivityScreenProps = StackScreenProps<
	RootStackParamList,
	"ManageHotelActivity"
>;

export type JourneyEsimDetailsScreenProps = StackScreenProps<
	RootStackParamList,
	"JourneyEsimDetails"
>;

export type MyBookingsScreenProps = StackScreenProps<
	RootStackParamList,
	"MyBookings"
>;

export type BookingDetailsScreenProps = StackScreenProps<
	RootStackParamList,
	"BookingDetails"
>;

export type CartScreenProps = CompositeScreenProps<
	StackScreenProps<RootStackParamList, "Cart">,
	BottomTabScreenProps<BottomTabParamList>
>;

export type PaymentScreenProps = StackScreenProps<
	RootStackParamList,
	"Payment"
>;

export type MyOrdersScreenProps = StackScreenProps<
	RootStackParamList,
	"MyOrders"
>;

export type OrderDetailsScreenProps = StackScreenProps<
	RootStackParamList,
	"OrderDetails"
>;

export type RescheduleScreenProps = StackScreenProps<
	RootStackParamList,
	"Reschedule"
>;

export type DutyFreeShopListScreenProps = StackScreenProps<
	RootStackParamList,
	"DutyFreeShopList"
>;

export type DutyFreeShopDetailsScreenProps = StackScreenProps<
	RootStackParamList,
	"DutyFreeShopDetails"
>;

export type DutyFreeProductsScreenProps = StackScreenProps<
	RootStackParamList,
	"DutyFreeProducts"
>;

export type DutyFreeProductDetailsScreenProps = StackScreenProps<
	RootStackParamList,
	"DutyFreeProductDetails"
>;

export type WishlistScreenProps = StackScreenProps<
	RootStackParamList,
	"Wishlist"
>;

export type PrebookScreenProps = StackScreenProps<
	RootStackParamList,
	"Prebook"
>;

export type PrebookSuccessScreenProps = StackScreenProps<
	RootStackParamList,
	"PrebookSuccess"
>;

export type LowSeasonDestinationListScreenProps = StackScreenProps<
	RootStackParamList,
	"LowSeasonDestinationList"
>;

export type LowSeasonDestinationScreenProps = StackScreenProps<
	RootStackParamList,
	"LowSeasonDestination"
>;

export type ManageFlightSearchScreenProps = StackScreenProps<
	RootStackParamList,
	"ManageFlightSearch"
>;

export type TopUpPaymentScreenProps = StackScreenProps<
	RootStackParamList,
	"TopUpPayment"
>;

export type EsimListScreenProps = StackScreenProps<
	RootStackParamList,
	"EsimList"
>;

export type DocumentFolderScreenProps = StackScreenProps<
	RootStackParamList,
	"DocumentFolder"
>;
