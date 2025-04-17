import React, { Component } from "react";
import { Text, StyleSheet, View, Image, ScrollView } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faDroplet } from "@fortawesome/pro-light-svg-icons/faDroplet";
import { faEye } from "@fortawesome/pro-light-svg-icons/faEye";
import { faTemperatureLow } from "@fortawesome/pro-light-svg-icons/faTemperatureLow";
import { faTemperatureHigh } from "@fortawesome/pro-light-svg-icons/faTemperatureHigh";
import { faGauge } from "@fortawesome/pro-light-svg-icons/faGauge";
import { faWind } from "@fortawesome/pro-regular-svg-icons/faWind";
import { Loader, NoResult } from "../../components";
import LocalizedText from "../../resources/LocalizedText";
import Constant from "../../configs/Constant";
import Colors from "../../configs/Colors";
import { fetchWeather } from "../../services/ApiService";
import { getWindDirection, calculateSun } from "../../utils/Util";

type Props = {
	airport_id: string;
	latitude: number;
	longitude: number;
	timeZone: string;
};

type States = {
	load: boolean;
	weather: undefined | any;
};

export default class WeatherTab extends Component<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			load: true,
			weather: undefined,
		};
	}

	componentDidMount = () => {
		this.fetchWeather();
	};

	fetchWeather = () => {
		let reqData = {
			airport_id: this.props.airport_id,
			latitude: this.props.latitude,
			longitude: this.props.longitude,
		};
		fetchWeather(reqData)
			.then((response) => {
				if (response.check === true) {
					this.setState({ weather: response.data, load: false });
				}
			})
			.catch((error) => {
				this.setState({ load: false });
			});
	};

	windDeg = (deg: number) => {
		return getWindDirection(deg);
	};

	calculateSunData = (time: number) => {
		return calculateSun(time, this.props.timeZone);
	};

	render() {
		const { weather, load } = this.state;
		return (
			<View style={styles.container}>
				{load ? (
					<Loader />
				) : typeof weather === "undefined" ? (
					<NoResult
						title={LocalizedText.NO_RESULR_FOUND}
						style={{ flex: 0.6 }}
						titleStyle={{ fontSize: 16 }}
					/>
				) : (
					<View
						style={{ flex: 1, width: "100%", backgroundColor: Colors.white }}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<View style={styles.mainView}>
								<Image
									source={{
										uri: `http://openweathermap.org/img/w/${weather.weather[0].icon}.png`,
									}}
									resizeMode="contain"
									style={{ height: "100%", width: 50 }}
								/>
								<Text style={styles.heading}>
									{`${Math.floor(weather.main.temp)}°c`}
								</Text>
							</View>
							<Text style={styles.status}>{weather.weather[0].main}</Text>

							<View style={styles.weatherDetailsBox}>
								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faDroplet}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{`${LocalizedText.HUMIDITY}`}
									</Text>
									<Text style={styles.listTitle}>
										{`${weather.main.humidity}%`}
									</Text>
								</View>

								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faEye}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{`${LocalizedText.VISIBILITY}`}
									</Text>
									<Text style={styles.listTitle}>
										{`${Number(weather.visibility / 1000).toFixed(1)} km`}
									</Text>
								</View>

								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faWind}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{typeof weather !== "undefined"
											? `${LocalizedText.WIND} ${this.windDeg(
													weather.wind.deg
											  )}`
											: ""}
									</Text>
									<Text style={styles.listTitle}>
										{` ${(weather.wind.speed * 3.6).toFixed(1)} km/h`}
									</Text>
								</View>

								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faGauge}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{`${LocalizedText.AIR_PRESSURE}`}
									</Text>
									<Text style={styles.listTitle}>
										{`${weather.main.pressure} hPa`}
									</Text>
								</View>

								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faTemperatureLow}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{`${LocalizedText.MIN_TEMP}`}
									</Text>
									<Text style={styles.listTitle}>
										{`${Math.floor(weather.main.temp_min)}°c`}
									</Text>
								</View>

								<View style={styles.weatherBox}>
									<FontAwesomeIcon
										icon={faTemperatureHigh}
										size={25}
										color={Colors.secondary}
										style={{ marginBottom: 8 }}
									/>
									<Text style={styles.listTitle}>
										{`${LocalizedText.MAX_TEMP}`}
									</Text>
									<Text style={styles.listTitle}>
										{`${Math.floor(weather.main.temp_max)}°c`}
									</Text>
								</View>
							</View>
						</ScrollView>
					</View>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		marginVertical: 10,
	},
	heading: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 44,
	},
	mainView: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	status: {
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 20,
		textAlign: "center",
		marginVertical: 3,
	},
	weatherDetailsBox: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		marginTop: 20,
	},
	weatherBox: {
		alignItems: "center",
		justifyContent: "center",
		height: 90,
		padding: 8,
		width: Math.floor(Constant.WINDOW_WIDTH / 3),
		marginVertical: 10,
	},
	listTitle: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		textAlign: "center",
		lineHeight: 22,
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
});
