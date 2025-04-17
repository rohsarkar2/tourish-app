import { Dimensions } from "react-native";
import { faHandshake } from "@fortawesome/pro-regular-svg-icons/faHandshake";
import { faWheelchair } from "@fortawesome/pro-regular-svg-icons/faWheelchair";
import { faCartFlatbedSuitcase } from "@fortawesome/pro-regular-svg-icons/faCartFlatbedSuitcase";
import { faCouch } from "@fortawesome/pro-regular-svg-icons/faCouch";
import Colors from "./Colors";

const screenWidth = Dimensions.get("screen").width;
const screenHeight = Dimensions.get("screen").height;
const winWidth = Dimensions.get("window").width;
const winHeight = Dimensions.get("window").height;

const Constant = {
	POST_REQUEST: "POST",
	GET_REQUEST: "GET",
	CONTENT_TYPE_JSON: "application/json",
	CONTENT_TYPE_FORMDATA: "multipart/form-data",
	SCREEN_WIDTH: screenWidth,
	SCREEN_HEIGHT: screenHeight,
	WINDOW_WIDTH: winWidth,
	WINDOW_HEIGHT: winHeight,
	DEFAULT_LANGUAGE_CODE: "en",
	DEFAULT_LANGUAGE_NAME: "English",
	AVAILABLE_LANGUAGES: [
		{ code: "en", name: "English" },
		{ code: "fr", name: "French" },
		{ code: "de", name: "German" },
	],
	PASSWORD_RULES: [
		{ id: "1", name: "Length: 8", isMatched: false },
		{ id: "2", name: "One Uppercase", isMatched: false },
		{ id: "3", name: "One Lowercase", isMatched: false },
		{ id: "4", name: "One Numeric", isMatched: false },
		{ id: "5", name: "One Special Character", isMatched: false },
	],
	CELL_COUNT: 4,
	CELL_SIZE: 40,
	TIMER_VALUE: 45,
	SEARCH_ITEM_TYPE_COUNTRY: "Country",
	SEARCH_ITEM_TYPE_PROVINCE: "Province",
	SEARCH_ITEM_TYPE_CITY: "City",
	SEARCH_ITEM_TYPE_AIRPORT: "Airport",
	SEARCH_ITEM_TYPE_LOCATION: "Location",
	SEARCH_ITEM_TYPE_PRODUCT: "Product",
	MEET_AND_GREET_SLUG: "meet-greet",
	WHEELCHAIR_SLUG: "wheelchair",
	PORTER_SLUG: "porter",
	LOUNGE_SLUG: "lounge",
	FLIGHT_SLUG: "Flight",
	CAB_SLUG: "Cab",
	HOTEL_SLUG: "Hotel",
	EVENT_SLUG: "Event",
	DOC_TYPE_PASSPORT: "Passport",
	DOC_TYPE_COVID: "Covid",
	DOC_TYPE_MEDICAL: "Medical",
	DOC_TYPE_TRAVEL_INSURANCE: "Travel Insurance",
	DOC_TYPE_OTHERS: "Others",
	JPG_MIME_TYPE: "image/jpeg",
	PNG_MIME_TYPE: "image/png",
	PDF_MIME_TYPE: "application/pdf",
	INCOMPLETE_SERVICE_STATUS: "Incomplete",
	PENDING_SERVICE_STATUS: "Pending",
	ACTIVE_SERVICE_STATUS: "Active",
	INACTIVE_SERVICE_STATUS: "Inactive",
	SERVICE_ICONS: {
		"meet-greet": faHandshake,
		wheelchair: faWheelchair,
		porter: faCartFlatbedSuitcase,
		lounge: faCouch,
	},
	ORDER_STATUS_COLOR: {
		pending: Colors.warning,
		placed: Colors.secondary,
		cancelled: Colors.danger,
		completed: Colors.success,
	},
	PENDING_ORDER_STATUS: "pending",
	PLACED_ORDER_STATUS: "placed",
	RESCHEDULED_ORDER_STATUS: "rescheduled",
	COMPLETE_ORDER_STATUS: "completed",
	CANCELLED_ORDER_STATUS: "cancelled",
	TRANSACTION_TYPE_PAYMENT: "PAYMENT",
	TRANSACTION_TYPE_REFUND: "REFUND",
	ARRIVAL_PURPOSE: "Arrival",
	DEPARTURE_PURPOSE: "Departure",
	PRICE_TYPE_COUPON: "C",
	PRICE_TYPE_AUTOMATIC: "A",
	MAX_RATING_VALE: 5.0,
	DEFAULT_LIMIT: 10,
	PAYMENT_FOR_SERVICE: "service",
	PAYMENT_FOR_VOUCHER: "voucher",
	FOLDER_TYPE: "folder",
	FILE_TYPE: "file",
	OTP_SOURCE: "Tourish App",
	OTP_PURPOSE_SIGN_UP: "Sign Up",
	OTP_PURPOSE_FORGOT_PASSWORD: "Forgot Password",
	OTP_PURPOSE_DELETE_ACCOUNT: "Delete Account",
	DELETE_ACCOUNT_APP_NAME: "TOURISH",
	DELETE_ACCOUNT_ORIGIN: "MOBILE_APP",
	APP_NAME: "TOURISH",
	CLIENT_KEY: "$2b$10$ugVu4gi7JA0VJWVrt9TwF.9wgPpDmlBkcb099vHvXkc6pwMlmzhxa",
	GOOGLE_SIGN_IN_WEBCLIENT_ID:
		"282570203228-gr41vaejeapqlpjo29tigac77mhvi9n7.apps.googleusercontent.com",
	GOOGLE_SIGN_IN_SCOPE: [
		"https://www.googleapis.com/auth/userinfo.profile",
		"https://www.googleapis.com/auth/userinfo.email",
	],
	STRIPE_PUBLISH_KEY:
		"pk_test_51LbMwMGemMWCdlTIG7TlsLBU8w9HhjS7JpiWX9JRv3iE8x5tMyrOX6mPqr0iLIYYBmUfhz0YwWtmBqeU6CECsWOp00ZSt8afkt",
};

export default Constant;
