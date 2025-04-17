import React, { createContext, useState } from "react";

type Props = {
	children: React.ReactNode;
};

export type WishlistItem = {
	_id: string;
	name: string;
	price: number;
	quantity: number;
	type: string;
	image: string;
	category: string;
	currencyCode: string;
};

export type ContextType = {
	wishlist: Array<WishlistItem>;
	addToWishlist: (item: WishlistItem) => void;
	removeFromWishlist: (itemId: string) => void;
	updateWishlist: (itemId: string, itemQuantity: number) => void;
	clearWishlist: () => void;
};

const WishlistContext = createContext<ContextType>({
	wishlist: [],
	addToWishlist: (item: WishlistItem) => {},
	removeFromWishlist: (itemId: string) => {},
	updateWishlist: (itemId: string, itemQuantity: number) => {},
	clearWishlist: () => {},
});

export const WishlistProvider: React.FC<Props> = ({ children }: Props) => {
	const [wishlist, setWishlist] = useState<Array<WishlistItem>>([]);

	const addToWishlist = (item: WishlistItem) => {
		const list = [...wishlist];
		list.push(item);
		setWishlist(list);
	};

	const removeFromWishlist = (itemId: string) => {
		setWishlist((prevWishlist) =>
			prevWishlist.filter((item) => item._id !== itemId)
		);
	};

	const updateWishlist = (itemId: string, itemQuantity: number) => {
		const dataArr = [...wishlist];
		const index = dataArr.findIndex((elem) => elem._id === itemId);

		if (index > -1) {
			const data1 = dataArr[index];
			const moddata = { ...data1, quantity: itemQuantity };
			const newArr = [...dataArr];
			newArr[index] = moddata;
			setWishlist(newArr);
		}
	};

	const clearWishlist = () => {
		setWishlist([]);
	};

	return (
		<WishlistContext.Provider
			value={{
				wishlist,
				addToWishlist,
				removeFromWishlist,
				updateWishlist,
				clearWishlist,
			}}
		>
			{children}
		</WishlistContext.Provider>
	);
};

export default WishlistContext;
