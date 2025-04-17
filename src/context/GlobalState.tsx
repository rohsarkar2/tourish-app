import React from "react";
import AppContext, { UserDataModel, SearchItem } from "./AppContext";

type Props = {
	userData: UserDataModel | null;
	children: React.ReactNode;
};

type States = {
	userData: UserDataModel | null;
	searchData: Array<SearchItem>;
};

export default class GlobalState extends React.Component<Props, States> {
	setUserData: (data: UserDataModel) => void;
	unsetUserData: () => void;
	getLatestSearchData: () => null | SearchItem;
	setSearchData: (data: Array<SearchItem>) => void;

	constructor(props: Props) {
		super(props);

		this.setUserData = (data: UserDataModel): void => {
			this.setState((state) => ({ userData: data }));
		};

		this.unsetUserData = () => {
			this.setState((state) => ({ userData: null }));
		};

		this.getLatestSearchData = (): null | SearchItem => {
			const { searchData } = this.state;
			const length: number = searchData.length;
			if (length > 0) {
				return searchData[length - 1];
			} else {
				return null;
			}
		};

		this.setSearchData = (data: Array<SearchItem>) => {
			this.setState((state) => ({ searchData: data }));
		};

		this.state = {
			userData: props.userData || null,
			searchData: [],
		};
	}

	render = () => (
		<AppContext.Provider
			value={{
				userData: this.state.userData,
				searchData: this.state.searchData,
				setUserData: this.setUserData,
				unsetUserData: this.unsetUserData,
				getLatestSearchData: this.getLatestSearchData,
				setSearchData: this.setSearchData,
			}}
		>
			{this.props.children}
		</AppContext.Provider>
	);
}
