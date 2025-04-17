import { axiosPublic } from "../axios/Axios";

export default class GlobalSearchService {
	static search = async (searchText: string) => {
		try {
			const response = await axiosPublic.get(`search?srchText=${searchText}`);
			return response.data;
		} catch (error: any) {
			throw new Error(error.response.data.message);
		}
	};
}
