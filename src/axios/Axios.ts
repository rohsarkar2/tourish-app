import axios from "axios";
import Config from "react-native-config";

export const axiosPublic = axios.create({
	baseURL: Config.API_URL,
});

export const axiosPrivate = axios.create({
	baseURL: Config.API_URL,
});
