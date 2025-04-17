import React from "react";
import {
	Alert,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
	BackHandler,
} from "react-native";
import Snackbar from "react-native-snackbar";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import * as mime from "react-native-mime-types";
import ImageView from "react-native-image-viewing";
import { Menu, MenuItem } from "react-native-material-menu";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFilter } from "@fortawesome/pro-light-svg-icons/faFilter";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import Share from "react-native-share";
import { DocumentFolderScreenProps } from "../navigation/NavigationTypes";
import {
	Container,
	FilePickerModal,
	Header,
	Loader,
	WhiteContainer,
	FabButton,
	BottomSheet,
	Button,
	NoResult,
	OverlayLoader,
	InputField,
} from "../components";
import AppContext from "../context/AppContext";
import MyDocService from "../services/MyDocService";
import LocalizedText from "../resources/LocalizedText";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import moment from "moment";
import DocumentActionMenu from "../components/DocumentActionMenu";
import TourBookService from "../services/TourBookService";

const validationSchema = Yup.object().shape({
	documentName: Yup.string().trim().required("Enter document name"),
});

type FormModel = {
	documentId: string;
	documentName: string;
};

type States = {
	searchValue: string;
	documents: any[];
	images: any[];
	selectedMenu: any;
	isLoading: boolean;
	isRefresing: boolean;
	isImageViewOpen: boolean;
	isProcessing: boolean;
	menuVisible: boolean;
	isDocRenameModalOpen: boolean;
};

export default class DocumentFolder extends React.Component<
	DocumentFolderScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private backHandler: any;
	private focusListner: any;
	private formikRef: React.RefObject<FormikProps<FormModel>>;
	private filepickermodal: React.RefObject<FilePickerModal>;

	constructor(props: DocumentFolderScreenProps) {
		super(props);

		this.state = {
			searchValue: "",
			documents: [],
			images: [],
			selectedMenu: { uploadedOn: -1 },
			isLoading: true,
			isRefresing: false,
			isImageViewOpen: false,
			isProcessing: false,
			menuVisible: false,
			isDocRenameModalOpen: false,
		};

		this.filepickermodal = React.createRef();
		this.formikRef = React.createRef();
	}

	componentDidMount = () => {
		// this.loadDocuments();
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.gotoBack
		);

		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount = () => {
		this.backHandler.remove();
		this.focusListner();
	};

	onFocusScreen = () => {
		this.setState({ isLoading: true, isRefresing: false }, () => {
			this.loadDocuments();
		});
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true }, () => {
			this.loadDocuments();
		});
	};

	gotoBack = () => {
		this.props.navigation.navigate("MyDocuments");
		return true;
	};

	loadDocuments = () => {
		const { userData } = this.context;
		const reqData: any = {
			customer_id: userData?._id,
			// sort: this.state.selectedMenu,
			folderId: this.props.route.params.folderId,
		};

		// if (typeof this.state.journeyID !== "undefined") {
		// 	reqData.journey_id = this.state.journeyID;
		// }

		MyDocService.getAllDocments(reqData)
			.then((response) => {
				this.setState({
					isLoading: false,
					isRefresing: false,
					menuVisible: false,
					documents: response,
				});
			})
			.catch((error) => {
				this.setState({ isLoading: false, isRefresing: false });
			});
	};

	showSnack = (message: string) => {
		setTimeout(() => {
			Snackbar.show({ text: message, duration: Snackbar.LENGTH_LONG });
		}, 500);
	};

	onSearch = (text: string) => {
		this.setState({ searchValue: text });
	};

	onCaptureImage = (data: any) => {
		this.uploadFile(data.attachmentTitle, data.fileData);
	};

	onSelectDocument = (data: any) => {
		this.uploadFile(data.attachmentTitle, data.fileData);
	};

	onSelectImage = (data: any) => {
		this.uploadFile(data.attachmentTitle, data.fileData);
	};

	hideMenu = () => {
		this.setState({ menuVisible: false });
	};

	onFilter = (sortValue: any) => {
		this.setState({ selectedMenu: sortValue }, () => {
			this.loadDocuments();
		});
	};

	showMenu = () => {
		this.setState({ menuVisible: true });
	};

	uploadFile = (dcoName: string, fileData: any) => {
		setTimeout(() => {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;
				const formData = new FormData();
				formData.append("customer_id", userData?._id);
				formData.append("folderId", this.props.route.params.folderId);
				formData.append("document_name", dcoName.trim());
				formData.append("document", fileData);

				MyDocService.upload(formData)
					.then((response) => {
						if (response.check) {
							const { documents } = this.state;
							let data = response.data;
							let allDocuments = [...documents];
							allDocuments.unshift(data);

							this.setState(
								{
									isProcessing: false,
									documents: allDocuments,
								},
								() => {
									this.showSnack(response.message);
								}
							);
						}
					})
					.catch((error) => {
						this.setState({ isProcessing: false });
					});
			});
		}, 350);
	};

	openImageView = (uri: string, fileName: string) => {
		if (
			typeof this.props.route.params?.type !== "undefined" &&
			typeof this.props.route.params.journeyId !== "undefined" &&
			typeof this.props.route.params.activityId !== "undefined" &&
			this.props.route.params.type === "upload"
		) {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;

				let reqData = {
					customerId: userData?._id,
					fileName: fileName,
					journeyId: this.props.route.params?.journeyId,
					activityId: this.props.route.params?.activityId,
				};

				TourBookService.addDocToJourney(reqData)
					.then((response) => {
						this.setState({ isProcessing: false }, () => {
							let journeyDetails: any = response.journeyDetails;
							let journeyID: string = journeyDetails.journeyId;
							let journeyTitle: string = journeyDetails.journeyName;
							const tabIndex: number = 1;
							this.showSnack(response.message);
							this.props.navigation.navigate("JourneyDetails", {
								journeyID,
								journeyTitle,
								tabIndex,
							});
						});
					})
					.catch((error) => {
						this.setState({ isProcessing: false });
					});
			});
		} else {
			this.setState({ isImageViewOpen: true, images: [{ uri }] });
		}
	};

	closeImageView = () => {
		this.setState({ isImageViewOpen: false });
	};

	openPdf = (url: string, fileName: string) => {
		if (
			typeof this.props.route.params?.type !== "undefined" &&
			typeof this.props.route.params.journeyId !== "undefined" &&
			typeof this.props.route.params.activityId !== "undefined" &&
			this.props.route.params.type === "upload"
		) {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;
				let reqData = {
					customerId: userData?._id,
					fileName: fileName,
					journeyId: this.props.route.params?.journeyId,
					activityId: this.props.route.params?.activityId,
				};

				TourBookService.addDocToJourney(reqData)
					.then((response) => {
						this.setState({ isProcessing: false }, () => {
							let journeyDetails: any = response.journeyDetails;
							let journeyID: string = journeyDetails.journeyId;
							let journeyTitle: string = journeyDetails.journeyName;
							const tabIndex: number = 1;
							this.showSnack(response.message);
							this.props.navigation.navigate("JourneyDetails", {
								journeyID,
								journeyTitle,
								tabIndex,
							});
						});
					})
					.catch((error) => {
						this.setState({ isProcessing: false });
					});
			});
		} else {
			this.setState({ isProcessing: true }, () => {
				const uriSegments: string[] = url.split("/");
				const filename: string = uriSegments[uriSegments.length - 1];
				const temPath: string = `${RNFS.TemporaryDirectoryPath}/${filename}`;
				const options = {
					fromUrl: url,
					toFile: temPath,
				};

				RNFS.downloadFile(options)
					.promise.then(() => {
						this.setState({ isProcessing: false }, () => {
							setTimeout(async () => {
								try {
									await FileViewer.open(temPath, {
										showOpenWithDialog: true,
										onDismiss: () => this.onClosePdf(temPath),
									});
								} catch (e) {}
							}, 350);
						});
					})
					.catch((error) => {
						this.setState({ isProcessing: false });
					});
			});
		}
	};

	onClosePdf = (temPath: string) => {
		RNFS.exists(temPath)
			.then(async (result) => {
				if (result) {
					try {
						await RNFS.unlink(temPath);
					} catch (e) {}
				}
			})
			.catch((err) => {});
	};

	onOpenRenameForm = (documentId: string, documentName: string) => {
		setTimeout(() => {
			this.setState({ isDocRenameModalOpen: true }, () => {
				this.formikRef &&
					this.formikRef.current?.setFieldValue("documentId", documentId);
				this.formikRef &&
					this.formikRef.current?.setFieldValue("documentName", documentName);
			});
		}, 350);
	};

	onCloseRenameForm = () => {
		this.setState({ isDocRenameModalOpen: false }, () => {
			this.formikRef && this.formikRef.current?.resetForm();
		});
	};

	onShareDocument = (url: string, documentName: string) => {
		setTimeout(() => {
			this.setState({ isProcessing: true }, () => {
				const uriSegments: string[] = url.split("/");
				const filename: string = uriSegments[uriSegments.length - 1];
				const temPath: string = `${RNFS.TemporaryDirectoryPath}/${filename}`;
				const options = {
					fromUrl: url,
					toFile: temPath,
				};

				RNFS.downloadFile(options)
					.promise.then(() => {
						RNFS.readFile(temPath, "base64")
							.then((fileContent: string) => {
								this.setState({ isProcessing: false }, async () => {
									await RNFS.unlink(temPath);
									const mimeType = mime.lookup(filename);
									const shareOption: any = {
										url: `data:${mimeType};base64,${fileContent}`,
										type: mimeType,
										filename: documentName,
									};

									try {
										await Share.open(shareOption);
									} catch (error) {}
								});
							})
							.catch((error) => {
								this.setState({ isProcessing: false }, async () => {
									await RNFS.unlink(temPath);
								});
							});
					})
					.catch((error) => {
						this.setState({ isProcessing: false });
					});
			});
		}, 350);
	};

	onDeleteDocument = (documentID: string) => {
		Alert.alert(LocalizedText.REMOVE_DOC, LocalizedText.REMOVE_DOC_ALERT, [
			{ text: LocalizedText.NO, style: "cancel" },
			{
				text: LocalizedText.YES,
				onPress: () => {
					this.setState({ isProcessing: true }, () => {
						const reqData = { document_id: documentID };
						MyDocService.delete(reqData)
							.then((response) => {
								const { documents } = this.state;
								const allDocuments = documents.filter(
									(item) => item._id !== documentID
								);
								this.setState(
									{ isProcessing: false, documents: allDocuments },
									() => {
										this.showSnack(response.message);
									}
								);
							})
							.catch((error) => {
								this.setState({ isProcessing: false });
							});
					});
				},
			},
		]);
	};

	openFilePicker = () => {
		this.filepickermodal && this.filepickermodal.current?.open();
	};

	getDocuments = () => {
		const { searchValue, documents } = this.state;
		let data = documents.filter((element) => {
			let name =
				typeof element.folderName !== "undefined"
					? element.folderName.toLowerCase()
					: element.documentName.toLowerCase();
			let searchVal = searchValue.toLowerCase();
			return name.includes(searchVal);
		});
		return data;
	};

	// tagItem = (documentID: string) => {
	// 	const { journeyID, documents } = this.state;

	// 	this.setState({ isProcessing: true }, () => {
	// 		const reqData: any = { document_id: documentID };
	// 		if (typeof journeyID !== "undefined") {
	// 			reqData.journey_id = journeyID;
	// 		}

	// 		MyDocService.tag(reqData)
	// 			.then((response) => {
	// 				const allDocuments = [...documents];
	// 				const index = allDocuments.findIndex(
	// 					(item) => item._id === documentID
	// 				);

	// 				if (index > -1) {
	// 					const data = allDocuments[index];
	// 					const taggedJourney = Array.isArray(data.taggedJourney)
	// 						? data.taggedJourney
	// 						: [];
	// 					taggedJourney.push(journeyID);
	// 					data.taggedJourney = [...taggedJourney];
	// 					allDocuments[index] = data;
	// 				}

	// 				this.setState(
	// 					{ isProcessing: false, documents: allDocuments },
	// 					() => {
	// 						this.showSnack(response.message);
	// 					}
	// 				);
	// 			})
	// 			.catch((error) => {
	// 				this.setState({ isProcessing: false });
	// 			});
	// 	});
	// };

	// untagItem = (documentID: string) => {
	// 	const { journeyID, documents } = this.state;

	// 	this.setState({ isProcessing: true }, () => {
	// 		const reqData: any = { document_id: documentID };
	// 		if (typeof journeyID !== "undefined") {
	// 			reqData.journey_id = journeyID;
	// 		}

	// 		MyDocService.untag(reqData)
	// 			.then((response) => {
	// 				const allDocuments = [...documents];
	// 				const index = allDocuments.findIndex(
	// 					(item) => item._id === documentID
	// 				);

	// 				if (index > -1) {
	// 					const data = allDocuments[index];
	// 					const taggedJourney = Array.isArray(data.taggedJourney)
	// 						? data.taggedJourney
	// 						: [];

	// 					const taggedIndex = taggedJourney.findIndex(
	// 						(element: string) => element === journeyID
	// 					);
	// 					if (taggedIndex > -1) {
	// 						taggedJourney.splice(taggedIndex, 1);
	// 					}

	// 					data.taggedJourney = [...taggedJourney];
	// 					allDocuments[index] = data;
	// 				}

	// 				this.setState(
	// 					{ isProcessing: false, documents: allDocuments },
	// 					() => {
	// 						this.showSnack(response.message);
	// 					}
	// 				);
	// 			})
	// 			.catch((error) => {
	// 				this.setState({ isProcessing: false });
	// 			});
	// 	});
	// };

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onRenameDocument = (values: FormModel) => {
		this.setState({ isDocRenameModalOpen: false }, () => {
			setTimeout(() => {
				this.setState({ isProcessing: true }, () => {
					const reqData: any = {
						documentId: values.documentId,
						documentName: values.documentName,
					};

					MyDocService.rename(reqData)
						.then((response: any) => {
							const { documents } = this.state;
							const allDocuments = [...documents];
							const index = allDocuments.findIndex(
								(item) => item._id === values.documentId
							);

							if (index > -1) {
								const item: any = allDocuments[index];
								item.documentName = values.documentName;
								allDocuments[index] = item;
							}

							this.setState(
								{ isProcessing: false, documents: allDocuments },
								() => {
									this.showSnack(response.message);
								}
							);
						})
						.catch((error) => {
							this.setState({ isProcessing: false });
						});
				});
			}, 350);
		});
	};

	renderItem = ({ item }: any) => {
		// const { journeyID } = this.state;
		// const taggedJourney = item.taggedJourney;
		const isPdf = mime.lookup(item.fileName) === Constant.PDF_MIME_TYPE;
		const isPng = mime.lookup(item.fileName) === Constant.PNG_MIME_TYPE;
		// const isTagged = taggedJourney.includes(journeyID);

		return (
			<View style={styles.itemContainer}>
				<TouchableHighlight
					underlayColor={Colors.lightGrey}
					style={{ flex: 1, height: "100%" }}
					onPress={
						isPdf
							? this.openPdf.bind(this, item.fileUri, item.fileName)
							: this.openImageView.bind(this, item.fileUri, item.fileName)
					}
				>
					<View style={{ width: "100%", height: "100%", flexDirection: "row" }}>
						<View style={styles.iconContainer}>
							{isPdf ? (
								<Image
									resizeMode="cover"
									source={require("../assets/images/pdf-file.png")}
									style={styles.icon}
								/>
							) : isPng ? (
								<Image
									resizeMode="cover"
									source={require("../assets/images/png-file.png")}
									style={styles.icon}
								/>
							) : (
								<Image
									resizeMode="cover"
									source={require("../assets/images/jpg-file.png")}
									style={styles.icon}
								/>
							)}
						</View>
						<View style={styles.textContainer}>
							<Text
								style={styles.documentName}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{item.documentName}
							</Text>
							<Text style={styles.date}>
								{moment(item.uploadedOn).format("D MMMM YYYY")}
							</Text>
						</View>
					</View>
				</TouchableHighlight>
				<View style={styles.actionContainer}>
					{/* {typeof journeyID !== "undefined" ? (
						<TouchableHighlight
							underlayColor={Colors.lightGrey}
							style={{ padding: 5, borderRadius: 100 }}
							onPress={
								isTagged
									? this.untagItem.bind(this, item._id)
									: this.tagItem.bind(this, item._id)
							}
						>
							<FontAwesomeIcon
								size={17}
								icon={isTagged ? faStarSolid : faStarLight}
								color={Colors.secondary}
							/>
						</TouchableHighlight>
					) : null} */}

					<DocumentActionMenu
						onRename={this.onOpenRenameForm.bind(
							this,
							item._id,
							item.documentName
						)}
						onShare={this.onShareDocument.bind(
							this,
							item.fileUri,
							item.documentName
						)}
						onDelete={this.onDeleteDocument.bind(this, item._id)}
					/>
				</View>
			</View>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => (
		<NoResult
			title={"No Documents Found"}
			style={{ flex: 0.6 }}
			titleStyle={{ fontSize: 16 }}
		/>
	);

	getListHeaderComponent = () => {
		const { userData } = this.context;
		return userData !== null ? (
			<View style={{ paddingHorizontal: 25 }}>
				<InputField
					label={`${LocalizedText.SEARCH}...`}
					value={this.state.searchValue}
					autoCapitalize="none"
					onChangeText={this.onSearch}
				/>
			</View>
		) : null;
	};

	render = () => {
		const allDocuments = this.getDocuments();
		return (
			<Container>
				<Header
					title={this.props.route.params.folderName}
					onBackAction={this.gotoBack}
				/>
				<WhiteContainer style={styles.container}>
					{this.state.isLoading ? (
						<Loader />
					) : (
						<>
							<FlatList
								data={allDocuments}
								renderItem={this.renderItem}
								keyExtractor={this.keyExtractor}
								refreshing={this.state.isRefresing}
								onRefresh={this.handelRefresh}
								initialNumToRender={50}
								maxToRenderPerBatch={50}
								removeClippedSubviews={true}
								showsVerticalScrollIndicator={false}
								keyboardShouldPersistTaps="handled"
								ListHeaderComponent={this.getListHeaderComponent.bind(this)}
								ListEmptyComponent={this.getListEmptyComponent.bind(this)}
								contentContainerStyle={
									this.state.documents.length <= 0 ? { flex: 1 } : null
								}
							/>
						</>
					)}
				</WhiteContainer>

				<FabButton icon={faPlus} onPress={this.openFilePicker} />

				<FilePickerModal
					ref={this.filepickermodal}
					onSelectImage={this.onSelectImage}
					onCaptureImage={this.onCaptureImage}
					onSelectDocument={this.onSelectDocument}
				/>

				<ImageView
					images={this.state.images}
					imageIndex={0}
					visible={this.state.isImageViewOpen}
					onRequestClose={this.closeImageView}
				/>

				<BottomSheet
					isVisible={this.state.isDocRenameModalOpen}
					title={"Rename Document"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.onCloseRenameForm}
				>
					<View style={{ padding: 20 }}>
						<Formik
							initialValues={{ documentId: "", documentName: "" }}
							validationSchema={validationSchema}
							onSubmit={this.onRenameDocument}
							innerRef={this.formikRef}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								touched,
								errors,
								values,
							}) => (
								<>
									<InputField
										label={"Document Name"}
										value={values.documentName}
										autoCapitalize="words"
										onChangeText={handleChange("documentName")}
										onBlur={handleBlur("documentName")}
										error={touched.documentName ? errors.documentName : null}
									/>
									<Button
										title={LocalizedText.UPDATE}
										style={{ marginTop: 30, width: "100%" }}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</View>
				</BottomSheet>

				<OverlayLoader visible={this.state.isProcessing} />
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 0,
		paddingTop: 20,
	},
	itemContainer: {
		width: "100%",
		height: 60,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 15,
	},
	iconContainer: {
		width: "20%",
		height: "100%",
		alignItems: "flex-start",
		justifyContent: "center",
	},
	icon: {
		height: 40,
		width: 40,
	},
	textContainer: {
		width: "80%",
		height: "100%",
		justifyContent: "center",
		paddingBottom: 3,
	},
	documentName: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		lineHeight: 24,
	},
	date: {
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		fontSize: 12,
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	actionContainer: {
		width: 70,
		height: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
	},
});
