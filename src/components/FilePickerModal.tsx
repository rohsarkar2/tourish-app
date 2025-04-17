import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	Keyboard,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/pro-solid-svg-icons/faCamera";
import { faFolderOpen } from "@fortawesome/pro-regular-svg-icons/faFolderOpen";
import { faFolderArrowUp } from "@fortawesome/pro-solid-svg-icons/faFolderArrowUp";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faImage } from "@fortawesome/pro-solid-svg-icons/faImage";
import { faFile } from "@fortawesome/pro-solid-svg-icons/faFile";
import { faCircleExclamation } from "@fortawesome/pro-regular-svg-icons/faCircleExclamation";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import DocumentPicker from "react-native-document-picker";
import * as mime from "react-native-mime-types";
import Modal from "react-native-modal";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import LocalizedText from "../resources/LocalizedText";
import {
	requestCameraPermission,
	requestStoragePermission,
	requestImageGalleryPermission,
} from "../utils/Util";
import InputField from "./InputField";

type Props = {
	onSelectImage: (data: any) => void;
	onCaptureImage: (data: any) => void;
	onSelectDocument: (data: any) => void;
	onOpenFolderModal?: () => void;
	onGotoMyDocuments?: () => void;
};

type States = {
	attachmentTitle: string;
	isAttachmentTitleValidationFailed: boolean;
	isModalOpen: boolean;
	isFolderNameModalOpen: boolean;
};

export default class FilePickerModal extends React.Component<Props, States> {
	constructor(props: Props) {
		super(props);

		this.state = {
			attachmentTitle: "",
			isAttachmentTitleValidationFailed: false,
			isModalOpen: false,
			isFolderNameModalOpen: false,
		};
	}

	open = () => {
		this.setState({
			isModalOpen: true,
			attachmentTitle: "",
			isAttachmentTitleValidationFailed: false,
		});
	};

	close = () => {
		Keyboard.dismiss();
		this.setState({
			isModalOpen: false,
			attachmentTitle: "",
			isAttachmentTitleValidationFailed: false,
		});
	};

	onChangeAttachmentTitle = (str: string) => {
		this.setState({ attachmentTitle: str });
	};

	onPressCamera = () => {
		const { attachmentTitle } = this.state;
		if (attachmentTitle.trim().length > 0) {
			this.setState({ isAttachmentTitleValidationFailed: false });
			requestCameraPermission(async () => {
				const options: any = {
					mediaType: "photo",
					selectionLimit: 1,
					saveToPhotos: false,
					quality: 0.9,
				};

				const result = await launchCamera(options);
				if (result.assets) {
					const title = this.state.attachmentTitle;
					const fileData: any = result.assets[0];
					const { onCaptureImage } = this.props;
					if (
						typeof onCaptureImage !== "undefined" &&
						typeof onCaptureImage === "function"
					) {
						this.close();
						onCaptureImage({
							attachmentTitle: title,
							fileData: {
								name: fileData.fileName,
								type: mime.lookup(fileData.fileName),
								uri: fileData.uri,
							},
						});
					}
				}
			});
		} else {
			this.setState({ isAttachmentTitleValidationFailed: true });
		}
	};

	onPressDocument = () => {
		const { attachmentTitle } = this.state;
		if (attachmentTitle.trim().length > 0) {
			this.setState({ isAttachmentTitleValidationFailed: false });

			requestStoragePermission(() => {
				const options: any = {
					allowMultiSelection: false,
					presentationStyle: "fullScreen",
					type: [DocumentPicker.types.pdf],
				};
				DocumentPicker.pick(options)
					.then((file) => {
						const { onSelectDocument } = this.props;
						if (
							typeof onSelectDocument !== "undefined" &&
							typeof onSelectDocument === "function"
						) {
							const title = this.state.attachmentTitle;
							const fileData: any = file[0];

							this.close();
							onSelectDocument({
								attachmentTitle: title,
								fileData: {
									name: fileData.name,
									type: mime.lookup(fileData.name),
									uri: fileData.uri,
								},
							});
						}
					})
					.catch((error) => this.close());
			});
		} else {
			this.setState({ isAttachmentTitleValidationFailed: true });
		}
	};

	onPressGallery = () => {
		const { attachmentTitle } = this.state;
		if (attachmentTitle.trim().length > 0) {
			this.setState({ isAttachmentTitleValidationFailed: false });
			requestImageGalleryPermission(async () => {
				const options: any = {
					mediaType: "photo",
					quality: 0.9,
					selectionLimit: 1,
				};

				const result = await launchImageLibrary(options);
				if (result.assets) {
					const title = this.state.attachmentTitle;
					const fileData: any = result.assets[0];
					const { onSelectImage } = this.props;

					if (
						typeof onSelectImage !== "undefined" &&
						typeof onSelectImage === "function"
					) {
						this.close();
						onSelectImage({
							attachmentTitle: title,
							fileData: {
								name: fileData.fileName,
								type: mime.lookup(fileData.fileName),
								uri: fileData.uri,
							},
						});
					}
				}
			});
		} else {
			this.setState({ isAttachmentTitleValidationFailed: true });
		}
	};

	render = () => (
		<Modal
			isVisible={this.state.isModalOpen}
			statusBarTranslucent={true}
			useNativeDriver={true}
			useNativeDriverForBackdrop={true}
			hideModalContentWhileAnimating={true}
			deviceHeight={Constant.SCREEN_HEIGHT}
			deviceWidth={Constant.SCREEN_WIDTH}
			style={styles.modalOverlay}
			backdropColor={"rgba(0,0,0,0.5)"}
			backdropOpacity={1}
			animationOutTiming={200}
			animationOut="fadeOut"
			backdropTransitionOutTiming={200}
			onBackButtonPress={this.close}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalHeader}>
					<Text style={styles.heading}>{LocalizedText.CHOOSE_OPTION}</Text>

					<TouchableHighlight
						underlayColor={Colors.lightGrey}
						style={styles.closeBtn}
						onPress={this.close}
					>
						<FontAwesomeIcon
							icon={faXmark}
							size={20}
							color={Colors.mediumGrey}
						/>
					</TouchableHighlight>
				</View>
				<View style={styles.modalBody}>
					<InputField
						value={this.state.attachmentTitle}
						label={LocalizedText.ATTACHMENT_NAME}
						autoCapitalize="words"
						onChangeText={this.onChangeAttachmentTitle}
						error={
							this.state.isAttachmentTitleValidationFailed
								? "Enter attachment name"
								: null
						}
					/>

					<View style={{ flexDirection: "row", width: "100%", marginTop: 30 }}>
						{/* <View style={styles.btnBox}>
							<TouchableHighlight
								underlayColor={Colors.secondaryAlpha2}
								style={styles.roundBtn}
								// onPress={this.onPressGallery}
							>
								<FontAwesomeIcon
									icon={faFolderOpen}
									size={25}
									color={Colors.secondary}
								/>
							</TouchableHighlight>
							<Text style={styles.btnTitle}>{"Folder"}</Text>
						</View> */}

						<View style={styles.btnBox}>
							<TouchableHighlight
								underlayColor={Colors.secondaryAlpha2}
								style={styles.roundBtn}
								onPress={this.onPressCamera}
							>
								<FontAwesomeIcon
									icon={faCamera}
									size={25}
									color={Colors.secondary}
								/>
							</TouchableHighlight>
							<Text style={styles.btnTitle}>{LocalizedText.CAMERA}</Text>
						</View>
						<View style={styles.btnBox}>
							<TouchableHighlight
								underlayColor={Colors.secondaryAlpha2}
								style={styles.roundBtn}
								onPress={this.onPressDocument}
							>
								<FontAwesomeIcon
									icon={faFile}
									size={25}
									color={Colors.secondary}
								/>
							</TouchableHighlight>
							<Text style={styles.btnTitle}>{LocalizedText.DOCUMENTS}</Text>
						</View>
						<View style={styles.btnBox}>
							<TouchableHighlight
								underlayColor={Colors.secondaryAlpha2}
								style={styles.roundBtn}
								onPress={this.onPressGallery}
							>
								<FontAwesomeIcon
									icon={faImage}
									size={25}
									color={Colors.secondary}
								/>
							</TouchableHighlight>
							<Text style={styles.btnTitle}>{LocalizedText.GALLERY}</Text>
						</View>
					</View>

					{typeof this.props.onOpenFolderModal !== "undefined" &&
					typeof this.props.onOpenFolderModal === "function" ? (
						<View
							style={{
								width: "100%",
								marginTop: 30,
							}}
						>
							{/* <Text
								style={{
									fontFamily: "Roboto-Regular",
									fontWeight: "400",
									fontSize: 14,
									color: Colors.lightFont,
								}}
							>
								{"Create a new folder"}
							</Text> */}
							<View
								style={{
									// width: Math.floor(Constant.WINDOW_WIDTH - 30),
									flexDirection: "row",
									padding: 10,
									backgroundColor: Colors.secondaryAlpha2,
									borderRadius: 5,
								}}
							>
								<View style={{ width: 30, alignItems: "flex-start" }}>
									<FontAwesomeIcon
										icon={faCircleExclamation}
										size={20}
										color={Colors.primary}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 12,
											color: Colors.lightFont,
											fontFamily: "Roboto-Regular",
											fontWeight: "400",
											lineHeight: 18,
										}}
									>
										{"You can now create a folder to store documents/files."}
									</Text>
								</View>
							</View>
							<View
								style={{
									marginTop: 20,
									paddingLeft: 30,
									justifyContent: "center",
								}}
							>
								<TouchableHighlight
									underlayColor={Colors.secondaryAlpha2}
									style={styles.roundBtn}
									onPress={this.props.onOpenFolderModal}
								>
									<FontAwesomeIcon
										icon={faFolderOpen}
										size={25}
										color={Colors.secondary}
									/>
								</TouchableHighlight>
								<Text style={[styles.btnTitle, { marginLeft: 4 }]}>
									{"Folder"}
								</Text>
							</View>
						</View>
					) : null}

					{typeof this.props.onGotoMyDocuments !== "undefined" &&
					typeof this.props.onGotoMyDocuments === "function" ? (
						<View
							style={{
								width: "100%",
								marginTop: 30,
							}}
						>
							{/* <Text
								style={{
									fontFamily: "Roboto-Regular",
									fontWeight: "400",
									fontSize: 14,
									color: Colors.lightFont,
								}}
							>
								{"Or upload from My Documents,"}
							</Text> */}
							<View
								style={{
									// width: Math.floor(Constant.WINDOW_WIDTH - 30),
									flexDirection: "row",
									padding: 10,
									backgroundColor: Colors.secondaryAlpha2,
									borderRadius: 5,
								}}
							>
								<View style={{ width: 30, alignItems: "flex-start" }}>
									<FontAwesomeIcon
										icon={faCircleExclamation}
										size={20}
										color={Colors.primary}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 12,
											color: Colors.lightFont,
											fontFamily: "Roboto-Regular",
											fontWeight: "400",
											lineHeight: 18,
										}}
									>
										{"You can now upload from My Documents too."}
									</Text>
								</View>
							</View>
							<View
								style={{
									marginTop: 20,
									paddingLeft: 10,
								}}
							>
								<TouchableHighlight
									underlayColor={Colors.secondaryAlpha2}
									style={[styles.roundBtn, { marginLeft: 20 }]}
									onPress={this.props.onGotoMyDocuments}
								>
									<FontAwesomeIcon
										icon={faFolderArrowUp}
										size={25}
										color={Colors.secondary}
									/>
								</TouchableHighlight>
								<Text style={[styles.btnTitle]}>{"My Documents"}</Text>
							</View>
						</View>
					) : null}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.6),
		backgroundColor: Colors.white,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	modalHeader: {
		height: 55,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 15,
	},
	heading: {
		fontFamily: "Poppins-SemiBold",
		fontWeight: "600",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	closeBtn: {
		position: "absolute",
		right: 8,
		padding: 5,
		borderRadius: 50,
	},
	modalBody: {
		flex: 1,
		paddingVertical: 20,
		paddingHorizontal: 20,
	},
	btnBox: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	roundBtn: {
		height: 50,
		width: 50,
		borderRadius: 100,
		backgroundColor: Colors.secondaryAlpha1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 5,
	},
	btnTitle: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		lineHeight: 25,
		color: Colors.primaryFont,
	},
});
