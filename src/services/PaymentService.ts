import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Util";

export default class PaymentService {
	static getIntent = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"v2/order/payment-intent",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static verify = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("v2/order/verify", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static esimTopUpIntent = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"v2/order/esim-topup-payment-intent",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static verifyTopUp = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"v2/order/esim-topup-verify",
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
