import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Util";

export default class TourBookService {
	static create = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/create",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static update = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/update",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static delete = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/delete",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getTourList = async (customerId: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`customer-journey/all?customer_id=${customerId}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getAll = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/journey-list",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getDocs = async (journeyID: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`customer-journey/docs?journey_id=${journeyID}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addDoc = async (formdata: FormData) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
			const response = await axiosPrivate.post(
				"customer-journey/add-doc",
				formdata,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getActivities = async (journeyID: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`customer-journey/activities?journey_id=${journeyID}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addActivity = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/add-activity",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static editActivity = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/edit-activity",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static deleteActivity = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/delete-activity",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addActivityAttachment = async (formData: FormData) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
			const response = await axiosPrivate.post(
				"customer-journey/activity-add-attachment",
				formData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addLocation = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/add-location",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static editLocation = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/edit-location",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static deleteLocation = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/delete-location",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static deleteActivityAttachment = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/delete-activity-attachment",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static deleteDocument = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/delete-doc",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static orderToTour = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/order-to-journey",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static getProducts = async (journeyId: string) => {
		try {
			const options = await getAxoisRequestHeaders();
			const response = await axiosPrivate.get(
				`customer-journey/products?journey_id=${journeyId}`,
				{ headers: options }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static addDocToJourney = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-journey/journey-document",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
