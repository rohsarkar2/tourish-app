import { axiosPrivate, axiosPublic } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Util";

export default class ProductService {
	static getCategories = async (queryParams: any) => {
		try {
			const params = [];
			for (const [key, value] of Object.entries(queryParams)) {
				params.push(`${key}=${value}`);
			}
			const url = "products/categories" + "?" + params.join("&");
			const response = await axiosPublic.get(url);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getLowSeasonProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/low-season", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getCarRentalProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/cab", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getCarRentalProductFilters = async (queryParams: any) => {
		try {
			const params = [];
			for (const [key, value] of Object.entries(queryParams)) {
				params.push(`${key}=${value}`);
			}
			const url = "products/cab/filter-option" + "?" + params.join("&");
			const response = await axiosPublic.get(url);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getEsimProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/e-sim", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getSimtexCurrencies = async () => {
		try {
			const response = await axiosPublic.get("products/simtex/currency");
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getSimtexQuotations = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"products/simtex/quote",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getDetails = async (productId: string, currency: string) => {
		try {
			let url =
				typeof currency === "undefined"
					? `products/get?product_id=${productId}`
					: `products/get?product_id=${productId}&to_currency=${currency}`;
			const response = await axiosPublic.get(url);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getMeetAndGreetProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/meet-greet", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getLoungeProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/lounge", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getPorterProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post("products/porter", payload);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getMobilityAssistProducts = async (payload: any) => {
		try {
			const response = await axiosPublic.post(
				"products/mobility-assist",
				payload
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getTimeSlots = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("products/slots", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getSimtexEsimDetails = async (esimId: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`products/simtex/details?eSIMId=${esimId}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getLowSeasonDestinationMonthWise = async (payload: any) => {
		try {
			const response = await axiosPublic.post(
				"products/month-wise/low-session",
				payload
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getLowSeasonDetails = async (productId: string) => {
		try {
			const response = await axiosPublic.get(
				`products/get?product_id=${productId}`
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getsimtexTopupQuotations = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"products/simtex/topup/quote",
				payload,
				{ headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static esimList = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"products/customer-wise/esim-list",
				payload,
				{
					headers: headers,
				}
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
