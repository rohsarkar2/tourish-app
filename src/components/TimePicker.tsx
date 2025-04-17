import React from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ViewStyle,
	Platform,
} from "react-native";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClock } from "@fortawesome/pro-light-svg-icons/faClock";
import Modal from "react-native-modal";
import WheelPicker from "react-native-wheely";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	label: string;
	value: null | Date;
	onTimeChange: (value: Date) => void;
	minuteInterVal?: number;
	minHour?: number;
	maxHour?: number;
	hasError?: boolean;
	style?: ViewStyle | Array<ViewStyle>;
};

type States = {
	isOpen: boolean;
	hourIndex: number;
	minuteIndex: number;
};

export default class TimePicker extends React.Component<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isOpen: false,
			hourIndex: 0,
			minuteIndex: 0,
		};
	}

	openPicker = () => {
		const { value } = this.props;
		const currentHour: string =
			value !== null ? moment(value).format("HH") : moment().format("HH");
		const currentMinute: string =
			value !== null ? moment(value).format("mm") : moment().format("mm");
		const hours: Array<string> = this.getHours();
		const minutes: Array<string> = this.getMinutes();

		const hIndex = hours.findIndex((item: string) => item === currentHour);
		const mIndex = minutes.findIndex((item: string) => item === currentMinute);

		this.setState({
			hourIndex: hIndex > -1 ? hIndex : 0,
			minuteIndex: mIndex > -1 ? mIndex : 0,
			isOpen: true,
		});
	};

	closePicker = () => {
		this.setState({ isOpen: false });
	};

	getHours = (): Array<string> => {
		const { minHour, maxHour } = this.props;
		const data: Array<string> = [];
		const min: number = typeof minHour !== "undefined" ? minHour : 0;
		const max: number = typeof maxHour !== "undefined" ? maxHour : 24;

		for (let i = min; i < max; i++) {
			data.push(i < 10 ? `0${i}` : `${i}`);
		}

		return data;
	};

	getMinutes = (): Array<string> => {
		const data: Array<string> = [];
		let i = 0;
		let interVal: number =
			typeof this.props.minuteInterVal !== "undefined"
				? this.props.minuteInterVal
				: 1;
		while (i < 60) {
			data.push(i < 10 ? `0${i}` : `${i}`);
			i = i + interVal;
		}

		return data;
	};

	onChangeHourIndex = (index: number) => {
		this.setState({ hourIndex: index });
	};

	onChangeMinuteIndex = (index: number) => {
		this.setState({ minuteIndex: index });
	};

	onConfirm = () => {
		const { hourIndex, minuteIndex } = this.state;
		const hours: Array<string> = this.getHours();
		const minutes: Array<string> = this.getMinutes();

		this.setState({ isOpen: false }, () => {
			const { onTimeChange } = this.props;
			const d: Date = new Date();

			d.setHours(Number(hours[hourIndex]));
			d.setMinutes(Number(minutes[minuteIndex]));
			d.setSeconds(0);
			onTimeChange(d);
		});
	};

	render = () => (
		<View
			style={[
				styles.container,
				this.props.style,
				this.props.hasError ? { borderBottomColor: Colors.danger } : null,
			]}
		>
			<TouchableOpacity
				onPress={this.openPicker}
				style={{
					width: "100%",
					height: "100%",
					flexDirection: "row",
					alignItems: "flex-end",
					justifyContent: "space-between",
					paddingBottom: 6,
				}}
			>
				{this.props.value === null ? (
					<Text
						style={[
							styles.label,
							this.props.hasError ? { color: Colors.danger } : null,
						]}
					>
						{this.props.label}
					</Text>
				) : (
					<Text style={[styles.label, { color: Colors.secondaryFont }]}>
						{moment(this.props.value).format("HH:mm")}
					</Text>
				)}

				<FontAwesomeIcon
					icon={faClock}
					size={17}
					color={this.props.hasError ? Colors.danger : Colors.mediumGrey}
				/>

				{this.props.value !== null ? (
					<View style={{ position: "absolute", top: 0, left: 0 }}>
						<Text style={[styles.label, { fontSize: 12 }]}>
							{this.props.label}
						</Text>
					</View>
				) : null}
			</TouchableOpacity>

			<Modal
				isVisible={this.state.isOpen}
				statusBarTranslucent={true}
				useNativeDriver={true}
				useNativeDriverForBackdrop={true}
				hideModalContentWhileAnimating={true}
				deviceHeight={Constant.SCREEN_HEIGHT}
				deviceWidth={Constant.SCREEN_WIDTH}
				style={styles.modalOverlay}
				backdropColor={"rgba(0,0,0,0.5)"}
				backdropOpacity={1}
				animationInTiming={350}
				animationOutTiming={250}
				animationIn="zoomIn"
				animationOut="zoomOut"
				onBackButtonPress={this.closePicker}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<Text style={styles.pickerTitle}>{LocalizedText.SELECT_TIME}</Text>
					</View>
					<View style={styles.modalBody}>
						<WheelPicker
							selectedIndex={this.state.hourIndex}
							options={this.getHours()}
							onChange={this.onChangeHourIndex}
							itemTextStyle={styles.itemTextStyle}
							selectedIndicatorStyle={styles.selectedIndicatorStyle}
						/>
						<View style={styles.pickerDevider}>
							<Text style={[styles.pickerTitle, { fontSize: 18 }]}>{":"}</Text>
						</View>
						<WheelPicker
							selectedIndex={this.state.minuteIndex}
							options={this.getMinutes()}
							onChange={this.onChangeMinuteIndex}
							itemTextStyle={styles.itemTextStyle}
							selectedIndicatorStyle={styles.selectedIndicatorStyle}
						/>
					</View>
					<View style={styles.modalFooter}>
						<TouchableOpacity style={styles.btn} onPress={this.closePicker}>
							<Text style={styles.btnText}>{LocalizedText.CANCEL}</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.btn} onPress={this.onConfirm}>
							<Text style={styles.btnText}>{LocalizedText.OK}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		height: 45,
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	label: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.mediumGrey,
	},
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 50,
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH - 100,
		backgroundColor: Colors.white,
		borderRadius: 3,
		padding: 10,
		...Platform.select({
			android: { height: Math.floor(Constant.WINDOW_HEIGHT * 0.5) },
			ios: { height: Math.floor(Constant.WINDOW_HEIGHT * 0.4) },
		}),
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 10,
	},
	modalBody: {
		flex: 1,
		width: "100%",
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	modalFooter: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 10,
		paddingVertical: 5,
	},
	pickerTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 16,
		color: Colors.primaryFont,
	},
	itemTextStyle: {
		fontSize: 16,
		fontFamily: "Robot-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
	},
	selectedIndicatorStyle: {
		backgroundColor: Colors.secondaryAlpha2,
		borderWidth: 1,
		borderColor: Colors.secondary,
	},
	pickerDevider: {
		width: 30,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	btn: {
		height: 40,
		width: "auto",
		minWidth: 50,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 8,
	},
	btnText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryBtn,
	},
});
