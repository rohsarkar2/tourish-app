import React from "react";
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPassport } from "@fortawesome/pro-light-svg-icons/faPassport";
import { faVirusCovid } from "@fortawesome/pro-light-svg-icons/faVirusCovid";
import { faFileMedical } from "@fortawesome/pro-light-svg-icons/faFileMedical";
import { faShieldCheck } from "@fortawesome/pro-light-svg-icons/faShieldCheck";
import { faNote } from "@fortawesome/pro-light-svg-icons/faNote";
import { faFileLines } from "@fortawesome/pro-light-svg-icons/faFileLines";
import { faFileImage } from "@fortawesome/pro-light-svg-icons/faFileImage";
import { faCirclePlus } from "@fortawesome/pro-light-svg-icons/faCirclePlus";
import { faXmark } from "@fortawesome/pro-light-svg-icons/faXmark";
import { faFolder } from "@fortawesome/pro-solid-svg-icons/faFolder";
import * as mime from "react-native-mime-types";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import { Loader, FilePickerModal, FabButton } from "../../components";
import LocalizedText from "../../resources/LocalizedText";
import {
	RootStackParamList,
	BottomTabParamList,
} from "../../navigation/NavigationTypes";
import AppContext from "../../context/AppContext";

type Props = {
	isLoading: boolean;
	journeyID: string;
	documents: any[];
	navigation: CompositeNavigationProp<
		StackNavigationProp<RootStackParamList>,
		BottomTabNavigationProp<BottomTabParamList>
	>;
	onUploadFile: (data: any) => void;
	onRemoveDocument: (docType: string, filename: string) => void;
	onOpenPdf: (url: string) => void;
	onOpenImage: (url: string) => void;
};

type States = {
	docType: string;
	allDocTypes: any[];
};

export default class JourneyDocuments extends React.Component<Props, States> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private filepickermodal: React.RefObject<FilePickerModal>;

	constructor(props: Props) {
		super(props);

		this.state = {
			docType: "",
			allDocTypes: [
				{ type: "Passport", typeName: LocalizedText.PASSPORT },
				{ type: "Covid", typeName: LocalizedText.COVID },
				{ type: "Medical", typeName: LocalizedText.MEDICAL },
				{ type: "Travel Insurance", typeName: LocalizedText.TRAVEL_INSURANCE },
				{ type: "Others", typeName: LocalizedText.OTHERS },
			],
		};

		this.filepickermodal = React.createRef();
	}

	openFilePickerModal = (type: string) => {
		this.setState({ docType: type }, () => {
			this.filepickermodal && this.filepickermodal.current?.open();
		});
	};

	onSelectImage = (data: any) => {
		const { onUploadFile } = this.props;
		if (
			typeof onUploadFile !== "undefined" &&
			typeof onUploadFile === "function"
		) {
			onUploadFile({
				attachment_type: this.state.docType,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	onCaptureImage = (data: any) => {
		const { onUploadFile } = this.props;
		if (
			typeof onUploadFile !== "undefined" &&
			typeof onUploadFile === "function"
		) {
			onUploadFile({
				attachment_type: this.state.docType,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	onSelectDocument = (data: any) => {
		const { onUploadFile } = this.props;
		if (
			typeof onUploadFile !== "undefined" &&
			typeof onUploadFile === "function"
		) {
			onUploadFile({
				attachment_type: this.state.docType,
				attachment_name: data.attachmentTitle,
				attachment: data.fileData,
			});
		}
	};

	getDocTypeIcon = (docType: string): any => {
		let icon = null;
		switch (docType) {
			case "Passport":
				icon = faPassport;
				break;
			case "Covid":
				icon = faVirusCovid;
				break;
			case "Medical":
				icon = faFileMedical;
				break;
			case "Travel Insurance":
				icon = faShieldCheck;
				break;
			case "Others":
				icon = faNote;
				break;
			default:
				break;
		}
		return icon;
	};

	getDocs = (type: string) => {
		const { documents } = this.props;
		let docs = (documents || []).filter((item) => item.type === type);
		return docs;
	};

	openImage = (uri: string) => {
		const { onOpenImage } = this.props;
		onOpenImage(uri);
	};

	openPdf = (url: string) => {
		const { onOpenPdf } = this.props;
		onOpenPdf(url);
	};

	gotoMyDocuments = () => {
		this.props.navigation.navigate("MyDocuments", {
			journey_id: this.props.journeyID,
		});
	};

	onRemoveFile = (docType: string, filename: string) => {
		Alert.alert(LocalizedText.REMOVE_DOC, LocalizedText.REMOVE_DOC_ALERT, [
			{ text: LocalizedText.NO, style: "cancel" },
			{
				text: LocalizedText.YES,
				onPress: () => {
					const { onRemoveDocument } = this.props;
					if (
						typeof onRemoveDocument !== "undefined" &&
						typeof onRemoveDocument === "function"
					) {
						onRemoveDocument(docType, filename);
					}
				},
			},
		]);
	};

	render = () =>
		this.props.isLoading ? (
			<Loader />
		) : (
			<View style={styles.tabComponent}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{this.state.allDocTypes.map((doctType) => (
						<View
							key={doctType.typeName.toLowerCase()}
							style={styles.activityWrapper}
						>
							<View
								style={[
									styles.activityBox,
									doctType.type === "Others"
										? { borderLeftColor: Colors.white }
										: null,
								]}
							>
								<View style={styles.activityTitleContainer}>
									<Text style={styles.activityTitle}>{doctType.typeName}</Text>
									<TouchableOpacity
										style={styles.plusBtn}
										onPress={this.openFilePickerModal.bind(this, doctType.type)}
									>
										<FontAwesomeIcon
											size={16}
											icon={faCirclePlus}
											color={Colors.primaryBtn}
										/>
									</TouchableOpacity>
								</View>
								<View style={styles.docChipWrapper}>
									{this.getDocs(doctType.type).map((item, index) => {
										let isPdf =
											mime.lookup(item.file) === Constant.PDF_MIME_TYPE;

										return (
											<View
												key={`${doctType.type.toLowerCase()}-${index}`}
												style={styles.docChip}
											>
												<TouchableOpacity
													style={{ flexDirection: "row" }}
													onPress={
														isPdf
															? this.openPdf.bind(this, item.uri)
															: this.openImage.bind(this, item.uri)
													}
												>
													<FontAwesomeIcon
														size={18}
														icon={isPdf ? faFileLines : faFileImage}
														color={Colors.mediumGrey}
													/>
													<Text style={styles.docTitle}>{item.name}</Text>
												</TouchableOpacity>

												<TouchableOpacity
													style={{ marginLeft: 8 }}
													onPress={this.onRemoveFile.bind(
														this,
														doctType,
														item.file
													)}
												>
													<FontAwesomeIcon
														size={16}
														icon={faXmark}
														color={Colors.danger}
													/>
												</TouchableOpacity>
											</View>
										);
									})}
								</View>
							</View>
							<View style={styles.activityIndicator}>
								<FontAwesomeIcon
									size={18}
									icon={this.getDocTypeIcon(doctType.type)}
									color={Colors.white}
								/>
							</View>
						</View>
					))}
				</ScrollView>

				<FabButton icon={faFolder} onPress={this.gotoMyDocuments} />

				<FilePickerModal
					ref={this.filepickermodal}
					onSelectImage={this.onSelectImage}
					onCaptureImage={this.onCaptureImage}
					onSelectDocument={this.onSelectDocument}
				/>
			</View>
		);
}

const styles = StyleSheet.create({
	tabComponent: {
		flex: 1,
		paddingTop: 15,
		paddingHorizontal: 15,
	},
	activityWrapper: {
		paddingLeft: 18,
	},
	activityBox: {
		width: "100%",
		paddingTop: 8,
		paddingLeft: 30,
		minHeight: 80,
		borderLeftWidth: 1,
		borderLeftColor: Colors.secondaryBtn,
	},
	activityTitleContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	activityTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		color: Colors.primaryFont,
	},
	plusBtn: {
		paddingHorizontal: 5,
	},
	activityIndicator: {
		position: "absolute",
		left: 0,
		top: 0,
		height: 35,
		width: 35,
		borderRadius: 100,
		backgroundColor: Colors.secondaryBtn,
		alignItems: "center",
		justifyContent: "center",
	},
	docChipWrapper: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 10,
	},
	docChip: {
		width: "auto",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 4,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 30,
		marginRight: 5,
		marginVertical: 5,
	},
	docTitle: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 13,
		color: Colors.secondaryFont,
		marginLeft: 5,
		opacity: 0.9,
	},
	modalOverlay: {
		padding: 0,
		margin: 0,
		alignItems: "center",
		justifyContent: "flex-end",
	},
	modalContainer: {
		width: Constant.WINDOW_WIDTH,
		height: Math.floor(Constant.WINDOW_HEIGHT * 0.65),
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
	modalCloseBtn: {
		position: "absolute",
		right: 8,
		padding: 5,
		borderRadius: 90,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 18,
		lineHeight: 24,
		color: Colors.primaryFont,
	},
	modalBody: {
		padding: 20,
	},
	submitBtn: {
		marginTop: 30,
		width: "100%",
	},
});
