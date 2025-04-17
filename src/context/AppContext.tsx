import React from "react";

export type UserDataModel = {
	_id: string;
	name: string;
	email: string;
	mobile: string;
	image: string | null;
	country: {
		_id: string;
		name: string;
		code: string;
	};
	currency: {
		name: string;
		code: string;
		// symbol: string;
		decimal_point: number;
	};
	default_language: {
		name: string;
		code: string;
	};
	total_cart_items: number;
};

export type SearchItem = {
	name: string;
	type: string;
	sourceId: string;
	country?: string;
	province?: string;
	provinceId?: string;
	city?: string;
	iataCode?: string;
};

export type ContextType = {
	userData: UserDataModel | null;
	searchData: Array<SearchItem>;
	setUserData: (data: UserDataModel) => void;
	unsetUserData: () => void;
	getLatestSearchData: () => null | SearchItem;
	setSearchData: (data: Array<SearchItem>) => void;
};

export default React.createContext<ContextType>({
	userData: null,
	searchData: [],
	setUserData: (data: UserDataModel) => {},
	unsetUserData: () => {},
	getLatestSearchData: () => null,
	setSearchData: (data: Array<SearchItem>) => {},
});
