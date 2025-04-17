import { axiosPublic } from "../axios/Axios";

export default class AirportService {
	static getAll = async (payload: any) => {
		try {
			let params = "";
			for (const key in payload) {
				params += `${key}=${payload[key]}&`;
			}
			const path: string = "airports?" + params.slice(0, -1);
			const response = await axiosPublic.get(path);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
