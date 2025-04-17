import React from "react";
import {
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
} from "react-native";
import AppContext from "../../context/AppContext";
import { DutyFreeShopListScreenProps } from "../../navigation/NavigationTypes";
import { Container, Header, NoResult, WhiteContainer } from "../../components";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";

const productList: Array<any> = [
	{
		_id: "6616982f2358eedec6d3ggj6",
		airport: {
			_id: "62626f44acdad049d7f0u8a9",
			city_id: "65940b9f4f126528d943b56f",
			iata_code: "DPS",
			name: "I Gusti Ngurah Rai International Airport",
		},
		category: "DUTY_FREE",
		city: {
			_id: "65940b9f4f126528d943b56f",
			name: "Denpasar",
		},
		country: {
			_id: "62615df4812156b78cacc224",
			name: "Indonesia",
		},
		name: "Air Acres Shop",
		province: {
			_id: "659402580ce040796e0af254",
			name: "Bali",
		},
		scope: "AIRPORT",
		seller: {
			_id: "61f7c2041d5f60fd547fb8dd",
			name: "Qbent Technologies Pvt. Ltd.",
		},
		subCategory: null,
		thumbnail: "6616986f2358eedec6d3ffd9.png",
		timeZone: "Asia/Makassar",
		url: require("../../assets/images/Air-Acres-Shop.png"),
	},
	{
		_id: "6616982f2358eedec6d3eeh9",
		airport: {
			_id: "62626f44acdad049d7f0d1a9",
			city_id: "65940b9f4f126528d943b56f",
			iata_code: "DPS",
			name: "I Gusti Ngurah Rai International Airport",
		},
		category: "DUTY_FREE",
		city: {
			_id: "65940b9f4f126528d943b56f",
			name: "Denpasar",
		},
		country: {
			_id: "62615df4812156b78cacc224",
			name: "Indonesia",
		},
		name: "Happy Shop",
		province: {
			_id: "659402580ce040796e0af254",
			name: "Bali",
		},
		scope: "AIRPORT",
		seller: {
			_id: "61f7c2041d5f60fd547fb8dd",
			name: "Qbent Technologies Pvt. Ltd.",
		},
		subCategory: null,
		thumbnail: "6616986f2358eedec6d3ffd9.png",
		timeZone: "Asia/Makassar",
		url: require("../../assets/images/Happy-shop.png"),
	},
];

type States = {};

export default class DutyFreeShopList extends React.Component<
	DutyFreeShopListScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: DutyFreeShopListScreenProps) {
		super(props);
	}

	listEmptyComponent = () => (
		<NoResult
			title={"No Results Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	goToShopDetails = (item: any) => {
		this.props.navigation.navigate("DutyFreeShopDetails", {
			shopName: item.name,
			airportName: item.airport.name,
			airportIATACode: item.airport.iata_code,
		});
	};

	renderItem = ({ item, index }: any) => {
		return (
			<TouchableHighlight
				key={index}
				underlayColor={Colors.lightGrey}
				style={styles.row}
				onPress={this.goToShopDetails.bind(this, item)}
			>
				<View style={{ flexDirection: "row" }}>
					<Image
						source={item.url}
						resizeMode="cover"
						style={{ height: 45, width: 45, borderRadius: 5, marginRight: 10 }}
					/>
					<View style={{ flex: 1 }}>
						<Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
							{item.name}
						</Text>
						<Text style={styles.subText}>
							{`${item.airport.name} (${item.airport.iata_code})`}
						</Text>
						<Text style={styles.subText}>
							{`${item.city.name}, ${item.province.name}, ${item.country.name}`}
						</Text>
					</View>
				</View>
			</TouchableHighlight>
		);
	};

	render = () => {
		return (
			<Container>
				<Header title="Duty Free Shops" />
				<WhiteContainer style={styles.container}>
					<FlatList
						data={productList}
						renderItem={this.renderItem}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={this.listEmptyComponent.bind(this)}
						contentContainerStyle={productList.length <= 0 ? { flex: 1 } : null}
					/>
				</WhiteContainer>
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 10,
		paddingHorizontal: 0,
	},
	row: {
		width: Math.floor(Constant.WINDOW_WIDTH - 30),
		marginHorizontal: 15,
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	title: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 13,
		lineHeight: 19,
		opacity: 0.9,
	},
	subText: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		opacity: 0.8,
	},
	boldText: {
		fontSize: 15,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		lineHeight: 22,
	},
});
