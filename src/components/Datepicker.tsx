import React from "react";
import {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	ViewStyle,
	Platform,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendar } from "@fortawesome/pro-light-svg-icons/faCalendar";
import { Calendar, DateData } from "react-native-calendars";
import Modal from "react-native-modal";
import moment from "moment-timezone";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import LocalizedText from "../resources/LocalizedText";

type Props = {
	label: string;
	value: null | string;
	onDateChange: (value: string) => void;
	hasError?: boolean;
	style?: ViewStyle | Array<ViewStyle>;
	maximumDate?: undefined | string;
	minimumDate?: undefined | string;
};

type States = {
	selectedDate: string;
	isOpen: boolean;
};

export default class Datepicker extends React.Component<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			selectedDate: moment().format("YYYY-MM-DD"),
			isOpen: false,
		};
	}

	openPicker = () => {
		const { value } = this.props;
		this.setState({
			selectedDate: value !== null ? value : moment().format("YYYY-MM-DD"),
			isOpen: true,
		});
	};

	closePicker = () => {
		this.setState({ isOpen: false });
	};

	onChangeDate = (date: DateData) => {
		this.setState({ selectedDate: date.dateString });
	};

	onConfirm = () => {
		const { onDateChange } = this.props;
		const { selectedDate } = this.state;
		this.setState({ isOpen: false }, () => {
			onDateChange(selectedDate);
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
				activeOpacity={0.4}
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
						{moment(this.props.value).format("DD/MM/YYYY")}
					</Text>
				)}

				<FontAwesomeIcon
					icon={faCalendar}
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
					<View style={styles.modalBody}>
						<Calendar
							style={{ width: Constant.WINDOW_WIDTH - 100 }}
							hideExtraDays={true}
							allowSelectionOutOfRange={false}
							initialDate={this.state.selectedDate}
							onDayPress={this.onChangeDate}
							markedDates={{
								[this.state.selectedDate]: {
									selected: true,
									disableTouchEvent: true,
								},
							}}
							maxDate={this.props.maximumDate}
							minDate={this.props.minimumDate}
							theme={{
								backgroundColor: Colors.white,
								calendarBackground: Colors.white,
								selectedDayBackgroundColor: Colors.primaryBtn,
								selectedDayTextColor: Colors.white,
								todayTextColor: Colors.secondary,
								dayTextColor: Colors.primaryFont,
								textDisabledColor: "#d9e1e8",
								arrowColor: Colors.primaryBtn,
								disabledArrowColor: "#d9e1e8",
								monthTextColor: Colors.primaryFont,
								indicatorColor: Colors.primaryBtn,
								textDayFontFamily: "Roboto-Regular",
								textMonthFontFamily: "Roboto-Regular",
								textDayHeaderFontFamily: "Roboto-Regular",
								textDayFontWeight: "400",
								textMonthFontWeight: "400",
								textDayHeaderFontWeight: "400",
								textDayFontSize: 14,
								textMonthFontSize: 14,
								textDayHeaderFontSize: 14,
							}}
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
		marginHorizontal: 35,
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH - 70,
		backgroundColor: Colors.white,
		borderRadius: 3,
		padding: 15,
		...Platform.select({
			android: { height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) },
			ios: { height: Math.floor(Constant.WINDOW_HEIGHT * 0.5) },
		}),
	},
	modalBody: {
		flex: 1,
		width: "100%",
	},
	modalFooter: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginTop: 10,
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
