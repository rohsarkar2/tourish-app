import { axiosPrivate, axiosPublic } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Util";

export const getAllCountries = async () => {
	try {
		const response = await axiosPublic.get("countries?status=true");
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const sendOTP = async (reqData = {}) => {
	try {
		const response = await axiosPublic.post("customers/sendotp", reqData);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const verifyOTP = async (reqData = {}) => {
	try {
		const response = await axiosPublic.post("customers/verify-otp", reqData);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const createAccount = async (reqData = {}) => {
	try {
		const response = await axiosPublic.post("customers/signup", reqData);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const userLogin = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"customers/validate",
			JSON.stringify(reqData),
			{
				headers: headers,
			}
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const validateGoogleAuthentication = async (payload = {}) => {
	try {
		const response = await axiosPublic.post(
			"customers/validate-google-auth",
			payload
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const validateAppleAuthentication = async (payload = {}) => {
	try {
		const response = await axiosPublic.post(
			"customers/validate-apple-auth",
			payload
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const verifyAccount = async (reqData = {}) => {
	try {
		const response = await axiosPublic.post(
			"customers/verify-account",
			reqData
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const resetPassword = async (newPassword: string, token: string) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": Constant.CONTENT_TYPE_JSON,
		};
		const response = await axiosPrivate.post(
			"customers/update-profile",
			JSON.stringify({ password: newPassword }),
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getCustomerData = async () => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get("customers/initiate", {
			headers: options,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAppVersion = async (
	appName: string,
	platform: string,
	appVersion: string
) => {
	try {
		const response = await axiosPublic.get(
			`app-version/details?name=${appName}&platform=${platform}&version=${appVersion}`
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const deleteAccount = async (payload: string, token: string) => {
	try {
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": Constant.CONTENT_TYPE_JSON,
		};
		const response = await axiosPrivate.post(
			"customers/delete-account",
			JSON.stringify(payload),
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAllServices = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("service/all", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchAirport = async (searchText: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`airports/search/all?srchText=${searchText}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getServiceDetails = async (
	serviceID: string,
	toCurrency: string
) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`service/get-one?id=${serviceID}&to_currency=${toCurrency}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getServiceSlots = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("service/slots", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAllCartItems = async (
	customerID: string,
	toCurrency: string
) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`cart?customer_id=${customerID}&to_currency=${toCurrency}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const addtoCart = async (reqData = {}) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get("cart/create", {
			headers: options,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const removeCartItem = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("cart/delete", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const applyPromoCode = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("cart/apply-promo-code", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const discardPromoCode = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"cart/discard-promo-code",
			reqData,
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const placeOrder = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("order/create", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getOrders = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("order/all", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getOrderDetails = async (orderID: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`order/details?order_id=${orderID}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getJourneyList = async (
	customerID: string,
	orderID: string | undefined = undefined
) => {
	try {
		let url = `customer-journey/all?customer_id=${customerID}`;
		if (typeof orderID !== "undefined") {
			url += `&order_id=${orderID}`;
		}
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(url, { headers: options });
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const orderToJourney = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"customer-journey/order-to-journey",
			reqData,
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAirportsByCity = async (cityID: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`cities/get-airports?cityid=${cityID}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getALlVouchers = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("voucher/all", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getVoucherDetails = async (
	voucherID: string,
	toCurrency: string
) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`voucher/get?id=${voucherID}&to_currency=${toCurrency}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const purchaseVoucher = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"customers/purchase-voucher",
			reqData,
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAllPurchaseVouchers = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("customers/vouchers", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getPurchaseVoucherDetails = async (voucherID: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`customers/voucher-details?id=${voucherID}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAirportData = async (airportId: string) => {
	try {
		const response = await axiosPublic.get(`airports/${airportId}`);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getFlightList = async (reqData: any) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("flights/timetable", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchCity = async (cityName: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`cities/search?searchText=${cityName}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getProfile = async () => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get("customers/profile", {
			headers: options,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const updateProfile = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"customers/update-profile",
			reqData,
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const checkOrderAmount = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post(
			"order/check-order-amount",
			reqData,
			{ headers: headers }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const fetchOrderPaymentIntent = async (reqData = {}) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("order/payment-intent", reqData, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const fetchWeather = async (payload: any) => {
	try {
		const response = await axiosPublic.post("weather/current", payload);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAllCoupons = async (payload: any) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("coupon/all", payload, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const getAllCurrencies = async () => {
	try {
		const response = await axiosPublic.get("currency/all");
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchFlightName = async (flightName: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`airline/search?searchText=${flightName}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchFlight = async (payload: any) => {
	try {
		const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
		const response = await axiosPrivate.post("flights/flight-search", payload, {
			headers: headers,
		});
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchCountry = async (searchTxt: string) => {
	try {
		const options = await getAxoisRequestHeaders();
		const response = await axiosPrivate.get(
			`countries/search?searchText=${searchTxt}`,
			{ headers: options }
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};

export const searchLowSeasonName = async (searchTxt: string) => {
	try {
		const response = await axiosPublic.get(
			`search/low-season?srchText=${searchTxt}`
		);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response.data.message);
	}
};
