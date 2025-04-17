import React from "react";
import { Text, StyleSheet, View } from "react-native";
import moment from "moment-timezone";
import LocalizedText from "../../resources/LocalizedText";

type Props = {
	timeZone: string;
	color: string;
};

type States = {
	currentTime: string;
};

export default class LocalTime extends React.Component<Props, States> {
	private interval: any;

	constructor(props: Props) {
		super(props);
		this.state = {
			currentTime: moment(new Date()).tz(this.props.timeZone).format("HH:mm"),
		};
	}

	componentDidMount = () => {
		this.interval = setInterval(() => {
			this.setState({
				currentTime: moment(new Date()).tz(this.props.timeZone).format("HH:mm"),
			});
		}, 60000);
	};

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		const { currentTime } = this.state;
		return (
			<View style={{ flexDirection: "row", alignItems: "center" }}>
				<Text style={[styles.normalText, { color: this.props.color }]}>
					{`${LocalizedText.LOCAL_TIME}: `}
				</Text>
				<Text style={[styles.boldText, { color: this.props.color }]}>
					{currentTime}
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	normalText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 10,
	},
	boldText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 12,
	},
});
