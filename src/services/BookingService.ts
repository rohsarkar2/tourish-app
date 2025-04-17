import { getAxoisRequestHeaders } from "../utils/Util";
import Constant from "../configs/Constant";
import { axiosPrivate } from "../axios/Axios";

export default class BookingService {
	static getDetails = async (bookingId: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(`bookings/${bookingId}`, {
				headers: options,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addBooking = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("bookings/create", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getAll = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post("bookings/all", payload, {
				headers: headers,
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
