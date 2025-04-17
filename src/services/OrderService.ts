import { getAxoisRequestHeaders } from "../utils/Util";
import Constant from "../configs/Constant";
import { axiosPrivate } from "../axios/Axios";

export default class OrderService {
	static getDetails = async (orderId: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`v2/order/details?order_id=${orderId}`,
				{
					headers: options,
				}
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getAll = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("v2/order/list", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getRescheduleReasons = async (category: any) => {
		try {
			const options = await getAxoisRequestHeaders(Constant.GET_REQUEST);
			const response = await axiosPrivate.get(
				`reason/list?prouctType=${category}&type=RESCHEDULE`,
				{
					headers: options,
				}
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static rescheduleOrder = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("v2/order/reschedule", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getCancelReasons = async (category: any) => {
		try {
			const options = await getAxoisRequestHeaders(Constant.GET_REQUEST);
			const response = await axiosPrivate.get(
				`reason/list?prouctType=${category}&type=CANCEL`,
				{
					headers: options,
				}
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static cancelOrder = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("v2/order/cancle", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static downloadInvoiceContent = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"v2/order/download-invoice",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
