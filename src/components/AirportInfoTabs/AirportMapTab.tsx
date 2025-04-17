import React from "react";
import {
	Text,
	StyleSheet,
	View,
	Linking,
	TouchableHighlight,
	Platform,
	Alert,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationDot } from "@fortawesome/pro-solid-svg-icons/faLocationDot";
import { faChevronRight } from "@fortawesome/pro-solid-svg-icons/faChevronRight";
import { InAppBrowser } from "react-native-inappbrowser-reborn";
import Colors from "../../configs/Colors";
import { IN_APP_BROWSER_OPTIONS } from "../../utils/Util";
import LocalizedText from "../../resources/LocalizedText";

type Props = {
	map: any[];
	lat: number;
	lng: number;
	name: string;
};

type States = {
	airportMap: any[];
	lat: number;
	lng: number;
};

export default class AirportMapTab extends React.Component<Props, States> {
	constructor(props: Props) {
		super(props);
		this.state = {
			airportMap: this.props.map,
			lat: this.props.lat,
			lng: this.props.lng,
		};
	}

	onClickUrl = async (item: any) => {
		Alert.alert(LocalizedText.WARNING, LocalizedText.THIRD_PARTY_WARNING_MSG, [
			{ text: LocalizedText.BACK, style: "cancel" },
			{
				text: LocalizedText.I_ACCEPT,
				onPress: async () => {
					const isAvailable: boolean = await InAppBrowser.isAvailable();
					if (isAvailable) {
						await InAppBrowser.open(item.link, IN_APP_BROWSER_OPTIONS);
					} else {
						Linking.openURL(item.link);
					}
				},
			},
		]);
	};

	onClickOpenMap = () => {
		let mapLocationUrl = "";
		if (Platform.OS === "ios") {
			mapLocationUrl += `http://maps.apple.com/?q=${this.props.name}&sll=${this.state.lat},${this.state.lng}`;
		} else {
			mapLocationUrl += `https://maps.google.com/?q=${this.props.name}&${this.state.lat},${this.state.lng}`;
		}
		Linking.openURL(mapLocationUrl);
	};

	render() {
		const { airportMap } = this.state;
		return (
			<View style={styles.container}>
				{airportMap.map.length > 0
					? airportMap.map((item: any, index) => (
							<TouchableHighlight
								key={index.toString()}
								onPress={this.onClickUrl.bind(this, item)}
								underlayColor={Colors.lightGrey}
							>
								<View style={styles.mapList}>
									<View style={styles.airportMapTitle}>
										<FontAwesomeIcon
											icon={faLocationDot}
											size={20}
											color={Colors.secondary}
										/>

										<Text style={styles.heading}>{item.title}</Text>
									</View>
									<FontAwesomeIcon
										icon={faChevronRight}
										size={18}
										color={Colors.secondary}
									/>
								</View>
							</TouchableHighlight>
					  ))
					: null}
				<TouchableHighlight
					onPress={this.onClickOpenMap}
					underlayColor={Colors.lightGrey}
				>
					<View style={styles.mapList}>
						<View style={styles.airportMapTitle}>
							<FontAwesomeIcon
								icon={faLocationDot}
								size={20}
								color={Colors.secondary}
							/>

							<Text style={styles.heading}>
								{Platform.OS === "ios"
									? "Open with Apple map"
									: "Open with Google map"}
							</Text>
						</View>
						<FontAwesomeIcon
							icon={faChevronRight}
							size={18}
							color={Colors.secondary}
						/>
					</View>
				</TouchableHighlight>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		padding: 10,
	},
	mapList: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		justifyContent: "space-between",
	},
	heading: {
		marginLeft: 10,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	airportMapTitle: {
		flexDirection: "row",
		alignItems: "center",
	},
});
