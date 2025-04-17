import { axiosPublic, axiosPrivate } from "../axios/Axios";
import Constant from "../configs/Constant";
import { getRefreshToken } from "../utils/Util";

export default class AuthService {
	static signIn = async (payload: any) => {
		try {
			const response = await axiosPublic.post("customers/validate", payload, {
				headers: { "Content-Type": Constant.CONTENT_TYPE_JSON },
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};

	static refreshToken = async () => {
		try {
			const token = await getRefreshToken();
			const response = await axiosPrivate.get("customers/refresh-token", {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
