import React from "react";
import { ScrollView, Alert } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	Button,
	OverlayLoader,
	OtpInputModal,
} from "../components";
import Constant from "../configs/Constant";
import {
	removeAccessToken,
	removeRefreshToken,
	saveAccessToken,
	saveRefreshToken,
} from "../utils/Util";
import {
	verifyAccount,
	verifyOTP,
	deleteAccount,
} from "../services/ApiService";
import { DeleteAccountScreenProps } from "../navigation/NavigationTypes";
import LocalizedText from "../resources/LocalizedText";
import AppContext from "../context/AppContext";
import { CommonActions } from "@react-navigation/native";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	message: Yup.string()
		.required("Enter remarks")
		.min(20, "Minimum 20 characters"),
});

type States = {
	name: string;
	email: string;
	message: string;
	isOtpModalOpen: boolean;
	showLoader: boolean;
};

export default class DeleteAccount extends React.Component<
	DeleteAccountScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;

	constructor(props: DeleteAccountScreenProps) {
		super(props);
		this.state = {
			name: "",
			email: "",
			message: "",
			isOtpModalOpen: false,
			showLoader: false,
		};
	}

	componentDidMount = () => {
		const { userData } = this.context;
		this.setState({
			name: userData?.name as string,
			email: userData?.email as string,
		});
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onSubmit = (values: any) => {
		this.setState({ message: values.message }, () => {
			this.onVerifyAccount();
		});
	};

	onResendOTP = () => {
		this.onVerifyAccount();
	};

	onVerifyAccount = () => {
		this.setState({ showLoader: true }, () => {
			verifyAccount({
				email: this.state.email,
				purpose: Constant.OTP_PURPOSE_DELETE_ACCOUNT,
				source: Constant.OTP_SOURCE,
			})
				.then((response) => {
					this.setState({
						showLoader: false,
						isOtpModalOpen: true,
					});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	onVerifyOTP = (code: any) => {
		const reqData = {
			email: this.state.email.trim().toLowerCase(),
			otp: Number(code),
			purpose: Constant.OTP_PURPOSE_DELETE_ACCOUNT,
		};

		verifyOTP(reqData)
			.then((response) => {
				if (response.check === true) {
					this.setState({ isOtpModalOpen: false }, () => {
						setTimeout(() => {
							const data = response.data;
							const accessToken = data.accessToken;

							this.onDeleteAccount(accessToken);
						}, 300);
					});
				} else {
					this.setState({ showLoader: false }, () => {
						Alert.alert("Failed", response.message);
					});
				}
			})
			.catch((error) => {
				this.setState({ showLoader: false });
			});
	};

	onDeleteAccount = (token: string) => {
		this.setState({ showLoader: true }, () => {
			const reqData: any = {
				app_name: Constant.DELETE_ACCOUNT_APP_NAME,
				request_origin: Constant.DELETE_ACCOUNT_ORIGIN,
				remarks: this.state.message.trim(),
			};

			deleteAccount(reqData, token)
				.then((response) => {
					this.setState({ showLoader: false }, () => {
						Alert.alert("Success", response.message, [
							{
								text: "OK",
								onPress: () => {
									removeAccessToken();
									removeRefreshToken();
									this.context.unsetUserData();
									this.props.navigation.reset({
										index: 0,
										routes: [{ name: "HomeTab" }],
									});
								},
							},
						]);
					});
				})
				.catch((error) => {
					this.setState({ showLoader: false });
				});
		});
	};

	render() {
		return (
			<Container>
				<Header title={LocalizedText.DELETE_ACCOUNT} />
				<WhiteContainer>
					<ScrollView
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<Formik
							initialValues={{ message: "" }}
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
									<InputField
										label={LocalizedText.NAME}
										value={this.state.name}
										autoCapitalize="words"
										editable={false}
									/>
									<InputField
										label={LocalizedText.EMAIL}
										value={this.state.email}
										autoCapitalize="words"
										editable={false}
									/>
									<InputField
										label={LocalizedText.MESSAGE}
										value={values.message}
										autoCapitalize="words"
										multiline={true}
										onChangeText={handleChange("message")}
										onBlur={handleBlur("message")}
										error={
											touched.message && errors.message
												? (errors.message as string)
												: null
										}
									/>
									<Button
										title={LocalizedText.SUBMIT}
										style={{ marginTop: 40 }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</ScrollView>

					<OtpInputModal
						isVisible={this.state.isOtpModalOpen}
						email={this.state.email}
						onResend={this.onResendOTP}
						onSubmit={this.onVerifyOTP}
					/>
					<OverlayLoader visible={this.state.showLoader} />
				</WhiteContainer>
			</Container>
		);
	}
}
