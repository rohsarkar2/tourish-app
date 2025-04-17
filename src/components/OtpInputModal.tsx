import React, { useState, useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Platform,
	StatusBar,
} from "react-native";
import Modal from "react-native-modal";
import {
	CodeField,
	Cursor,
	useBlurOnFulfill,
	useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEnvelopeCircleCheck } from "@fortawesome/pro-regular-svg-icons/faEnvelopeCircleCheck";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import Button from "./Button";

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
		paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
		justifyContent: "space-between",
	},
	codeFiledRoot: {
		marginTop: 40,
		width: "95%",
		paddingHorizontal: "5%",
	},
	cellRoot: {
		width: Constant.CELL_SIZE,
		height: Constant.CELL_SIZE,
		justifyContent: "center",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: Colors.mediumGrey,
	},
	cellText: {
		fontSize: 18,
		fontWeight: "400",
		fontFamily: "Roboto-Regular",
		color: Colors.secondaryFont,
		textAlign: "center",
	},
	focusCell: {
		borderBottomWidth: 1,
		borderBottomColor: Colors.primaryBtn,
	},
	resendTextContainer: {
		width: "100%",
		flexDirection: "row",
		marginTop: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	subText: {
		textAlign: "center",
		fontWeight: "400",
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		lineHeight: 20,
		color: Colors.secondaryFont,
		opacity: 0.6,
	},
	resendText: {
		fontSize: 16,
		lineHeight: 20,
		fontWeight: "500",
		color: Colors.primaryBtn,
		fontFamily: "Roboto-Medium",
	},
});

type Props = {
	isVisible: boolean;
	email: string;
	onSubmit: (value: any) => void;
	onResend: () => void;
};

const OtpInputModal: React.FC<Props> = (ownProps) => {
	const [value, setValue] = useState<string>("");
	const [timerValue, setTimerValue] = useState<number>(Constant.TIMER_VALUE);
	const [timerExpired, setTimerExpired] = useState<boolean>(false);
	const [isButtonDisabled, setButtonDisabled] = useState<boolean>(true);
	const [isVerificationFailed, setVerificationStatus] =
		useState<boolean>(false);

	const codeFieldRef = useBlurOnFulfill({
		value,
		cellCount: Constant.CELL_COUNT,
	});

	const [props, getCellOnLayoutHandler] = useClearByFocusCell({
		value,
		setValue,
	});

	/**
	 * @Desc: Input Handler
	 */
	const inputHandler = (value: null | string) => {
		if (value !== null) {
			setValue(value);
			setButtonDisabled(value.toString().length !== Constant.CELL_COUNT);
		}
	};

	/**
	 * @Desc: Render Cell
	 */
	const renderCell = ({
		index,
		symbol,
		isFocused,
	}: any): React.ReactElement => {
		return (
			<View
				key={index}
				style={[
					styles.cellRoot,
					isFocused && styles.focusCell,
					isVerificationFailed ? { borderBottomColor: Colors.danger } : null,
				]}
				onLayout={getCellOnLayoutHandler(index)}
			>
				<Text style={styles.cellText}>
					{symbol || (isFocused ? <Cursor /> : null)}
				</Text>
			</View>
		);
	};

	/**
	 * @Desc: Update Timer
	 */
	const updateTimer = () => {
		const x = setInterval(() => {
			if (timerValue <= 1) {
				setTimerExpired(true);
			} else {
				setTimerValue(timerValue - 1);
			}
		}, 1000);
		return x;
	};

	/**
	 * @Desc: Resend OTP
	 */
	const resendOTP = async () => {
		setValue("");
		setVerificationStatus(false);
		setButtonDisabled(true);
		setTimerValue(Constant.TIMER_VALUE);
		setTimerExpired(false);
		const { onResend } = ownProps;

		if (typeof onResend !== "undefined" && typeof onResend === "function") {
			onResend();
		}
	};

	/**
	 * @Desc: Verify OTP
	 */
	const submitData = async () => {
		setVerificationStatus(false);
		const { onSubmit } = ownProps;
		if (typeof onSubmit !== "undefined" && typeof onSubmit === "function") {
			onSubmit(value);
		}
	};

	useEffect(() => {
		const timer = updateTimer();
		return () => clearInterval(timer);
	}, [timerValue]);

	const onModalWillOpen = () => {
		setValue("");
		setVerificationStatus(false);
		setButtonDisabled(true);
		setTimerValue(Constant.TIMER_VALUE);
		setTimerExpired(false);
	};

	return (
		<Modal
			isVisible={ownProps.isVisible}
			statusBarTranslucent={true}
			useNativeDriver={true}
			useNativeDriverForBackdrop={true}
			hideModalContentWhileAnimating={true}
			deviceHeight={Constant.SCREEN_HEIGHT}
			deviceWidth={Constant.SCREEN_WIDTH}
			style={styles.modalOverlay}
			backdropColor={"rgba(0,0,0,0.5)"}
			backdropOpacity={1}
			animationIn="slideInRight"
			animationOut="slideOutRight"
			animationOutTiming={200}
			backdropTransitionOutTiming={200}
			onModalWillShow={onModalWillOpen}
			onBackButtonPress={undefined}
		>
			<View style={styles.modalContainer}>
				<View style={{ flex: 1 }}>
					<View
						style={{
							height: 100,
							width: 100,
							alignSelf: "center",
							backgroundColor: "rgba(240, 240, 240, 0.7)",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 100,
							marginTop: 50,
							marginBottom: 15,
						}}
					>
						<FontAwesomeIcon
							icon={faEnvelopeCircleCheck}
							size={60}
							color={Colors.secondary}
						/>
					</View>

					<Text
						style={{
							fontSize: 25,
							fontFamily: "Roboto-Medium",
							fontWeight: "500",
							color: Colors.primaryFont,
							textAlign: "center",
							lineHeight: 50,
						}}
					>
						{"Email Verification"}
					</Text>

					{ownProps.email ? (
						<Text style={styles.subText}>
							{"We have sent a code to your email"}
						</Text>
					) : null}

					{ownProps.email ? (
						<Text
							style={[styles.subText, { color: Colors.primary, opacity: 0.9 }]}
						>
							{ownProps.email}
						</Text>
					) : null}

					<CodeField
						ref={codeFieldRef}
						value={value}
						cellCount={Constant.CELL_COUNT}
						rootStyle={styles.codeFiledRoot}
						keyboardType="number-pad"
						textContentType="oneTimeCode"
						onChangeText={inputHandler}
						renderCell={renderCell}
					/>

					{timerExpired ? (
						<View style={styles.resendTextContainer}>
							<Text style={styles.subText}>{"Don't receive code?"}</Text>
							<TouchableOpacity
								activeOpacity={0.6}
								style={{ padding: 5 }}
								onPress={resendOTP}
							>
								<Text style={styles.resendText}>{"Resend"}</Text>
							</TouchableOpacity>
						</View>
					) : (
						<Text style={{ marginTop: 25, textAlign: "center" }}>
							{"Resend code in "}
							<Text style={{ color: Colors.primary }}>
								{timerValue > 9 ? "00:" + timerValue : "00:0" + timerValue}
							</Text>
						</Text>
					)}
				</View>

				<Button
					disabled={isButtonDisabled}
					title={"Verify & Proceed"}
					onPress={submitData}
				/>
			</View>
		</Modal>
	);
};

export default OtpInputModal;
