import { axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getAxoisRequestHeaders } from "../utils/Util";

export default class MyDocService {
	static getAllDocments = async (payload: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/all",
				payload,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static upload = async (formdata: FormData) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
			const response = await axiosPrivate.post(
				"customer-document/upload",
				formdata,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static delete = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/delete",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static tag = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/tag",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static untag = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/untag",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static rename = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/rename",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static createFolder = async (reqData: any) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST);
			const response = await axiosPrivate.post(
				"customer-document/create-folder",
				reqData,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static externalUpload = async (formdata: FormData) => {
		try {
			const headers = await getAxoisRequestHeaders(Constant.POST_REQUEST, true);
			const response = await axiosPrivate.post(
				"customer-document/external-upload",
				formdata,
				{ headers: headers }
			);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
