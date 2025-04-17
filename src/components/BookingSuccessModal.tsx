import React, { forwardRef, useState, useImperativeHandle, Ref } from "react";
import { StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons";
import {
	CompositeNavigationProp,
	useNavigation,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../navigation/NavigationTypes";
import { BottomTabParamList } from "../navigation/NavigationTypes";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import Button from "./Button";

type RefObject = {
	open: (
		title: string,
		message: string,
		bookingNo: string,
		bookingDate: string
	) => void;
};

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	modalContainer: {
		flex: 1,
		width: "100%",
		backgroundColor: Colors.white,
		paddingHorizontal: 25,
		paddingBottom: 25,
		justifyContent: "space-between",
	},
	flexRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	title: {
		fontSize: 18,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		marginTop: 30,
	},
	lightText: {
		fontSize: 14,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
});

const BookingSuccessModal = forwardRef((props, ref: Ref<RefObject>) => {
	const navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	> = useNavigation();
	const [title, setTitle] = useState<string>("Booking Confirmed");
	const [message, setMessage] = useState<string>(
		"Congratulation, your booking has been confirmed."
	);
	const [bookingNo, setBookingNo] = useState<string>("");
	const [bookingDate, setBookingDate] = useState<string>("");
	const [isModalOpen, setModal] = useState<boolean>(false);

	useImperativeHandle(ref, () => ({ open: openModal }));

	const openModal = (
		title: string,
		message: string,
		bookingNo: string,
		bookingDate: string
	) => {
		setTitle(title);
		setMessage(message);
		setBookingNo(bookingNo);
		setBookingDate(bookingDate);
		setModal(true);
	};

	const onCloseModal = () => {
		setModal(false);
	};

	const gotoMyBookings = () => {
		setModal(false);
		setTimeout(() => {
			navigation.reset({
				index: 0,
				routes: [{ name: "MyBookings" }],
			});
		}, 300);
	};

	return (
		<Modal
			isVisible={isModalOpen}
			statusBarTranslucent={true}
			useNativeDriver={true}
			useNativeDriverForBackdrop={true}
			hideModalContentWhileAnimating={true}
			deviceHeight={Constant.SCREEN_HEIGHT}
			deviceWidth={Constant.SCREEN_WIDTH}
			style={styles.modalOverlay}
			backdropColor={"rgba(0,0,0,0.5)"}
			backdropOpacity={1}
			animationInTiming={250}
			animationOutTiming={250}
			onBackButtonPress={onCloseModal}
		>
			<View style={styles.modalContainer}>
				<View
					style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
				>
					<FontAwesomeIcon
						icon={faCircleCheck}
						size={100}
						color={Colors.success}
					/>
					<Text style={styles.title}>{title}</Text>
					<Text style={[styles.lightText, { textAlign: "center" }]}>
						{message}
					</Text>
					<View style={[styles.flexRow, { marginTop: 15 }]}>
						<Text style={styles.lightText}>{"Reference Number - "}</Text>
						<Text style={styles.lightText}>{bookingNo}</Text>
					</View>
					<View style={styles.flexRow}>
						<Text style={styles.lightText}>{"Date & Time - "}</Text>
						<Text style={styles.lightText}>{bookingDate}</Text>
					</View>
				</View>
				<Button title="My Bookings" onPress={gotoMyBookings} />
			</View>
		</Modal>
	);
});

export default BookingSuccessModal;
