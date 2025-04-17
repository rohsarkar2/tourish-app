import { getAxoisRequestHeaders } from "../utils/Util";
import Constant from "../configs/Constant";
import { axiosPrivate } from "../axios/Axios";

export default class CartService {
	static add = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("cart/create", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static delete = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("cart/delete", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static get = async (customerId: string, currency: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`cart?customerId=${customerId}&toCurrency=${currency}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static applyCoupon = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"cart/apply-promo-code",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static discardCoupon = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"cart/discard-promo-code",
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

	static checkout = async () => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get("cart/checkout", {
				headers: options,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
