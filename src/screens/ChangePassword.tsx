import React from "react";
import {
	StyleSheet,
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faEye } from "@fortawesome/pro-light-svg-icons/faEye";
import { faEyeSlash } from "@fortawesome/pro-light-svg-icons/faEyeSlash";
import { Formik } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	OverlayLoader,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import { updateProfile } from "../services/ApiService";
import { ChangePasswordScreenProps } from "../navigation/NavigationTypes";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	password: Yup.string()
		.required("Enter your new password")
		.min(8, "Password must contain at least 8 characters")
		.matches(
			/[A-Z]/,
			"Password must contain at least 8 characters with 1 character in capital, 1 number and 1 special character"
		)
		.matches(/[a-z]/, "Password must have one uppercase letter")
		.matches(
			/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/,
			"Password must have one special character"
		)
		.matches(/\d/, "Password must have one number"),
	confirmPassword: Yup.string()
		.required("Enter confirm password")
		.oneOf([Yup.ref("password")], "Password and confirm password not match"),
});

type States = {
	visiblePassword: boolean;
	showLoader: boolean;
};

export default class ChangePassword extends React.Component<
	ChangePasswordScreenProps,
	States
> {
	constructor(props: ChangePasswordScreenProps) {
		super(props);

		this.state = {
			// password: "",
			// confirmPassword: "",
			// passwordRules: Constant.PASSWORD_RULES,
			visiblePassword: false,
			// isPasswordValidationFailed: true,
			// isConfirmPasswordValidationFailed: true,
			showLoader: false,
		};
	}

	/*setPassword = (pass) => {
		let rules = this.state.passwordRules;
		rules[0].isMatched = pass.trim().length >= 8;
		rules[1].isMatched = (pass.match(/[A-Z]/g) || []).length > 0;
		rules[2].isMatched = (pass.match(/[a-z]/g) || []).length > 0;
		rules[3].isMatched = (pass.match(/[0-9]/g) || []).length > 0;
		rules[4].isMatched =
			(pass.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g) || []).length > 0;

		this.setState(
			{
				password: pass,
				passwordRules: rules,
			},
			() => {
				let check = this.validate({
					password: {
						required: true,
						minlength: 8,
						hasNumber: true,
						hasUpperCase: true,
						hasLowerCase: true,
						hasSpecialCharacter: true,
					},
				});
				this.setState({ isPasswordValidationFailed: !check });
			}
		);
	};*/

	// setConfirmPassword = (pass) => {
	// 	this.setState({ confirmPassword: pass }, () => {
	// 		let check = this.validate({
	// 			confirmPassword: {
	// 				required: true,
	// 				equalPassword: this.state.password,
	// 			},
	// 		});
	// 		this.setState({ isConfirmPasswordValidationFailed: !check });
	// 	});
	// };

	toggleVisiblePassword = () => {
		this.setState({ visiblePassword: !this.state.visiblePassword });
	};

	// checkFormValidation = () => {
	// 	return (
	// 		this.state.isPasswordValidationFailed ||
	// 		this.state.isConfirmPasswordValidationFailed
	// 	);
	// };

	gotoAccount = () => {
		this.props.navigation.navigate("Account");
	};

	/*onUpdatePassword = () => {
		this.setState({ showLoader: true }, () => {
			let reqData = { password: this.state.password };
			updateProfile(reqData)
				.then((response) => {
					this.setState({ showLoader: false }, () => {
						if (response.check === true) {
							Alert.alert(
								LocalizedText.PASSWORD_SUCCESS_TITLE,
								LocalizedText.PASSWORD_SUCCESS,
								[{ text: LocalizedText.OK, onPress: this.gotoAccount }]
							);
						} else {
							Alert.alert(LocalizedText.FAILED, response.message);
						}
					});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};*/

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: any) => {
		this.setState({ showLoader: true }, () => {
			let reqData = { password: values.password };
			updateProfile(reqData)
				.then((response) => {
					this.setState({ showLoader: false }, () => {
						if (response.check === true) {
							Alert.alert(
								LocalizedText.PASSWORD_SUCCESS_TITLE,
								LocalizedText.PASSWORD_SUCCESS,
								[{ text: LocalizedText.OK, onPress: this.gotoAccount }]
							);
						} else {
							Alert.alert(LocalizedText.FAILED, response.message);
						}
					});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	render = () => (
		<Container>
			<Header title={LocalizedText.CHANGE_PASSWORD} />
			<WhiteContainer>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Formik
						initialValues={{
							password: "",
							confirmPassword: "",
						}}
						validationSchema={validationSchema}
						onSubmit={this.onSubmit}
					>
						{({
							handleChange,
							handleSubmit,
							handleBlur,
							touched,
							errors,
							values,
						}) => (
							<>
								<View style={{ width: "100%" }}>
									<InputField
										secureTextEntry={!this.state.visiblePassword}
										value={values.password}
										label={LocalizedText.PASSWORD}
										autoCapitalize="none"
										onChangeText={handleChange("password")}
										onBlur={handleBlur("password")}
										error={
											touched.password && errors.password
												? errors.password
												: null
										}
									/>
									<TouchableOpacity
										style={[
											styles.eyeBtn,
											touched.password && errors.password
												? { bottom: 15 }
												: null,
										]}
										onPress={this.toggleVisiblePassword}
									>
										<FontAwesomeIcon
											icon={this.state.visiblePassword ? faEye : faEyeSlash}
											size={18}
											color={Colors.secondaryFont}
										/>
									</TouchableOpacity>
								</View>
								<InputField
									value={values.confirmPassword}
									label={LocalizedText.CONFIRM_NEW_PASSWORD}
									autoCapitalize="none"
									secureTextEntry={true}
									onChangeText={handleChange("confirmPassword")}
									onBlur={handleBlur("confirmPassword")}
									error={
										touched.confirmPassword && errors.confirmPassword
											? errors.confirmPassword
											: null
									}
								/>
								<Button
									title={LocalizedText.UPDATE_PASSWORD}
									style={{ marginTop: 30 }}
									onPress={this.onHandleValidation.bind(this, handleSubmit)}
								/>
							</>
						)}
					</Formik>
					{/* <View style={{ width: "100%" }}>
						<TextInput
							secureTextEntry={!this.state.visiblePassword}
							value={this.state.password}
							label={LocalizedText.PASSWORD}
							autoCapitalize="none"
							onChangeText={this.setPassword}
							error={
								this.isFieldInError("password")
									? LocalizedText.PASSWORD_ERROR
									: null
							}
						/>
						<TouchableOpacity
							style={[
								styles.eyeBtn,
								this.isFieldInError("password") ? { bottom: 35 } : null,
							]}
							onPress={this.toggleVisiblePassword}
						>
							<FontAwesomeIcon
								icon={this.state.visiblePassword ? faEye : faEyeSlash}
								size={18}
								color={Colors.secondaryFont}
							/>
						</TouchableOpacity>
					</View>

					{this.isFieldInError("password") ? (
						<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
							{this.state.passwordRules.map((v, i) => (
								<View key={v.id} style={styles.ruleBox}>
									<FontAwesomeIcon
										icon={faCircle}
										size={7}
										color={v.isMatched ? Colors.success : Colors.danger}
									/>
									<Text style={styles.passRule}>{v.name}</Text>
								</View>
							))}
						</View>
					) : null}

					<TextInput
						value={this.state.confirmPassword}
						label={LocalizedText.CONFIRM_NEW_PASSWORD}
						autoCapitalize="none"
						secureTextEntry={true}
						onChangeText={this.setConfirmPassword}
						error={
							this.isFieldInError("confirmPassword")
								? LocalizedText.CONFIRM_PASSWORD_ERROR
								: null
						}
					/>
					<Button
						disabled={this.checkFormValidation()}
						title={LocalizedText.UPDATE_PASSWORD}
						style={{ marginTop: 30 }}
						onPress={this.onUpdatePassword}
					/> */}
				</ScrollView>
			</WhiteContainer>

			<OverlayLoader visible={this.state.showLoader} />
		</Container>
	);
}

const styles = StyleSheet.create({
	profileText: {
		borderWidth: 1,
	},
	label: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		lineHeight: 20,
		fontSize: 14,
		color: Colors.mediumGrey,
		marginVertical: 12,
	},
	grayBtn: {
		width: 110,
		height: 35,
		backgroundColor: Colors.lightGrey,
		alignItems: "center",
		justifyContent: "center",
	},
	grayBtnText: {
		fontFamily: "Roboto-Regular",
		fontSize: 13,
		lineHeight: 20,
		color: Colors.secondaryFont,
		fontWeight: "400",
	},
	eyeBtn: {
		position: "absolute",
		right: 0,
		bottom: 15,
		padding: 5,
	},
	ruleBox: {
		flexDirection: "row",
		alignItems: "center",
		width: "50%",
	},
	passRule: {
		marginLeft: 5,
		fontSize: 14,
		color: Colors.secondaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		opacity: 0.5,
	},
});
