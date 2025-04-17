import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	FlatList,
	Alert,
	Image,
	TouchableOpacity,
	Modal,
	BackHandler,
} from "react-native";
import moment from "moment-timezone";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus } from "@fortawesome/pro-solid-svg-icons/faPlus";
import { faFolder } from "@fortawesome/pro-regular-svg-icons/faFolder";
import { faStar as faStarSolid } from "@fortawesome/pro-solid-svg-icons/faStar";
import { faStar as faStarLight } from "@fortawesome/pro-light-svg-icons/faStar";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faFilter } from "@fortawesome/pro-light-svg-icons/faFilter";
import { faFolderOpen } from "@fortawesome/pro-regular-svg-icons/faFolderOpen";
import ImageView from "react-native-image-viewing";
import * as mime from "react-native-mime-types";
import Snackbar from "react-native-snackbar";
import { Menu, MenuItem } from "react-native-material-menu";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import Share from "react-native-share";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import {
	Container,
	WhiteContainer,
	Header,
	FabButton,
	FilePickerModal,
	OverlayLoader,
	Loader,
	NoResult,
	BottomSheet,
	Button,
	InputField,
	SignInRequired,
} from "../components";
import DocumentActionMenu from "../components/DocumentActionMenu";
import Constant from "../configs/Constant";
import Colors from "../configs/Colors";
import MyDocService from "../services/MyDocService";
import LocalizedText from "../resources/LocalizedText";
import { MyDocumentScreenProps } from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import { CommonActions } from "@react-navigation/native";
import TourBookService from "../services/TourBookService";

const validationSchema = Yup.object().shape({
	documentName: Yup.string().trim().required("Enter document name"),
});

const folderValidationSchema = Yup.object().shape({
	folderName: Yup.string().trim().required("Enter folder name"),
});

const folderRenameValidationSchema = Yup.object().shape({
	folderName: Yup.string().trim().required("Enter folder name"),
});

type FormModel = {
	documentId: string;
	documentName: string;
};

type FormModel2 = {
	folderName: string;
};

type FormModel3 = {
	folderId: string;
	folderName: string;
};

type States = {
	journeyID: undefined | string;
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
	isFolderModalOpen: boolean;
	isFolderRenameModalOpen: boolean;
};

export default class MyDocuments extends React.Component<
	MyDocumentScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private backHandler: any;
	private focusListner: any;
	private filepickermodal: React.RefObject<FilePickerModal>;
	private formikRef: React.RefObject<FormikProps<FormModel>>;
	private formikRef2: React.RefObject<FormikProps<FormModel2>>;
	private formikRef3: React.RefObject<FormikProps<FormModel3>>;

	constructor(props: MyDocumentScreenProps) {
		super(props);

		this.state = {
			journeyID:
				typeof props.route.params !== "undefined"
					? props.route.params.journey_id
					: undefined,
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
			isFolderModalOpen: false,
			isFolderRenameModalOpen: false,
		};

		this.filepickermodal = React.createRef();
		this.formikRef = React.createRef();
		this.formikRef2 = React.createRef();
		this.formikRef3 = React.createRef();
	}

	componentDidMount = () => {
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
		const { userData } = this.context;
		if (userData !== null) {
			this.setState({ isLoading: true, isRefresing: false }, () => {
				if (this.props.route.params?.type === "ExternalUpload") {
					const sharedFiles: Array<any> = this.props.route.params?.sharedFiles;

					let documentName: Array<any> = [];

					sharedFiles.forEach((item: any) => {
						const filenameWithoutExtension = (item.fileName || "").split(".");
						documentName.push(
							filenameWithoutExtension[0].replace(/[()\s]/g, "")
						);
					});

					const { userData } = this.context;
					const formData = new FormData();
					formData.append("customer_id", userData?._id);
					formData.append("document_name", JSON.stringify(documentName));
					for (let i = 0; i < sharedFiles.length; i++) {
						let fileData: any = {
							name: sharedFiles[i].fileName,
							type: sharedFiles[i].mimeType,
							uri: sharedFiles[i].contentUri,
						};
						formData.append("document", fileData);
					}

					MyDocService.externalUpload(formData)
						.then((response) => {
							if (response.check) {
								this.setState({ isLoading: false }, () => {
									this.loadDocuments();
									this.showSnack(response.message);
								});
							}
						})
						.catch((error) => {
							this.setState({ isLoading: false });
						});
				} else {
					this.loadDocuments();
				}
			});
		} else {
			this.setState({ isLoading: false, isProcessing: false });
		}
	};

	handelRefresh = () => {
		this.setState({ isRefresing: true }, () => {
			this.loadDocuments();
		});
	};

	gotoBack = () => {
		this.props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: "HomeTab",
						params: { screen: "Account" },
					},
				],
			})
		);
		return true;
	};

	loadDocuments = () => {
		const { userData } = this.context;
		const reqData: any = {
			customer_id: userData?._id,
			sort: this.state.selectedMenu,
		};

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

	uploadFile = (docName: string, fileData: any) => {
		setTimeout(() => {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;
				const formData = new FormData();
				formData.append("customer_id", userData?._id);
				formData.append("document_name", docName.trim());
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
			typeof this.props.route.params.journey_id !== "undefined" &&
			typeof this.props.route.params.activityId !== "undefined" &&
			this.props.route.params.type === "upload"
		) {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;

				let reqData = {
					customerId: userData?._id,
					fileName: fileName,
					journeyId: this.props.route.params?.journey_id,
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
			typeof this.props.route.params.journey_id !== "undefined" &&
			typeof this.props.route.params.activityId !== "undefined" &&
			this.props.route.params.type === "upload"
		) {
			this.setState({ isProcessing: true }, () => {
				const { userData } = this.context;
				let reqData = {
					customerId: userData?._id,
					fileName: fileName,
					journeyId: this.props.route.params?.journey_id,
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

	onOpenRenameFolderForm = (folderId: string, folderName: string) => {
		setTimeout(() => {
			this.setState({ isFolderRenameModalOpen: true }, () => {
				this.formikRef3 &&
					this.formikRef3.current?.setFieldValue("folderId", folderId);
				this.formikRef3 &&
					this.formikRef3.current?.setFieldValue("folderName", folderName);
			});
		}, 350);
	};

	onCloseRenameFolderForm = () => {
		this.setState({ isFolderRenameModalOpen: false }, () => {
			this.formikRef3 && this.formikRef3.current?.resetForm();
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

	onDeleteDocument = (itemId: string, type: string) => {
		if (type === Constant.FILE_TYPE) {
			Alert.alert(LocalizedText.REMOVE_DOC, LocalizedText.REMOVE_DOC_ALERT, [
				{ text: LocalizedText.NO, style: "cancel" },
				{
					text: LocalizedText.YES,
					onPress: () => {
						this.setState({ isProcessing: true }, () => {
							const reqData = { document_id: itemId };
							MyDocService.delete(reqData)
								.then((response) => {
									const { documents } = this.state;
									const allDocuments = documents.filter(
										(item) => item._id !== itemId
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
		} else {
			Alert.alert(
				"Delete folder",
				"Are you sure you want to delete this folder?",
				[
					{ text: LocalizedText.NO, style: "cancel" },
					{
						text: LocalizedText.YES,
						onPress: () => {
							this.setState({ isProcessing: true }, () => {
								const reqData = { folderId: itemId };
								MyDocService.delete(reqData)
									.then((response) => {
										const { documents } = this.state;
										const allDocuments = documents.filter(
											(item) => item._id !== itemId
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
				]
			);
		}
	};

	openFilePicker = () => {
		this.filepickermodal && this.filepickermodal.current?.open();
	};

	// getDocuments = () => {
	// 	const { searchValue, documents } = this.state;
	// 	const data = documents.filter((element) => {
	// 		let name = element.documentName.toLowerCase();
	// 		let index = name.indexOf(searchValue.toLowerCase());
	// 		return index > -1;
	// 	});

	// 	return data;
	// };

	getDocuments = () => {
		const { searchValue, documents } = this.state;
		let data = documents.filter((element) => {
			let name =
				typeof element.folderName !== "undefined"
					? element.folderName.toLowerCase()
					: element.documentName.toLowerCase();
			// let documentName = element.documentName.toLowerCase();
			// let folderName = element.folderName.toLowerCase();
			let searchVal = searchValue.toLowerCase();
			return name.includes(searchVal);
		});
		return data;
	};

	tagItem = (documentID: string) => {
		const { journeyID, documents } = this.state;

		this.setState({ isProcessing: true }, () => {
			const reqData: any = { document_id: documentID };
			if (typeof journeyID !== "undefined") {
				reqData.journey_id = journeyID;
			}

			MyDocService.tag(reqData)
				.then((response) => {
					const allDocuments = [...documents];
					const index = allDocuments.findIndex(
						(item) => item._id === documentID
					);

					if (index > -1) {
						const data = allDocuments[index];
						const taggedJourney = Array.isArray(data.taggedJourney)
							? data.taggedJourney
							: [];
						taggedJourney.push(journeyID);
						data.taggedJourney = [...taggedJourney];
						allDocuments[index] = data;
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
	};

	untagItem = (documentID: string) => {
		const { journeyID, documents } = this.state;

		this.setState({ isProcessing: true }, () => {
			const reqData: any = { document_id: documentID };
			if (typeof journeyID !== "undefined") {
				reqData.journey_id = journeyID;
			}

			MyDocService.untag(reqData)
				.then((response) => {
					const allDocuments = [...documents];
					const index = allDocuments.findIndex(
						(item) => item._id === documentID
					);

					if (index > -1) {
						const data = allDocuments[index];
						const taggedJourney = Array.isArray(data.taggedJourney)
							? data.taggedJourney
							: [];

						const taggedIndex = taggedJourney.findIndex(
							(element: string) => element === journeyID
						);
						if (taggedIndex > -1) {
							taggedJourney.splice(taggedIndex, 1);
						}

						data.taggedJourney = [...taggedJourney];
						allDocuments[index] = data;
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
	};

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

	onRenameFolder = (values: FormModel3) => {
		this.setState({ isFolderRenameModalOpen: false }, () => {
			setTimeout(() => {
				this.setState({ isProcessing: true }, () => {
					const reqData: any = {
						folderId: values.folderId,
						folderName: values.folderName,
					};

					MyDocService.rename(reqData)
						.then((response: any) => {
							const { documents } = this.state;
							const allDocuments = [...documents];
							const index = allDocuments.findIndex(
								(item) => item._id === values.folderId
							);

							if (index > -1) {
								const item: any = allDocuments[index];
								item.folderName = values.folderName;
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

	goToDocumentFolder = (folderId: string, folderName: string) => {
		if (this.props.route.params?.type === "upload") {
			this.props.navigation.navigate("DocumentFolder", {
				type: "upload",
				folderId: folderId,
				folderName: folderName,
				journeyId: this.props.route.params.journey_id,
				activityId: this.props.route.params.activityId,
			});
		} else {
			this.props.navigation.navigate("DocumentFolder", {
				folderId: folderId,
				folderName: folderName,
			});
		}
	};

	renderItem = ({ item }: any) => {
		const { journeyID } = this.state;
		// const taggedJourney = item.taggedJourney;
		const isPdf = mime.lookup(item.fileName) === Constant.PDF_MIME_TYPE;
		const isPng = mime.lookup(item.fileName) === Constant.PNG_MIME_TYPE;
		// const isTagged = taggedJourney.includes(journeyID);

		return (
			<View style={styles.itemContainer}>
				{item.type === Constant.FOLDER_TYPE ? (
					<>
						<TouchableHighlight
							underlayColor={Colors.lightGrey}
							style={{ flex: 1, height: "100%" }}
							onPress={this.goToDocumentFolder.bind(
								this,
								item._id,
								item.folderName
							)}
						>
							<View
								style={{ width: "100%", height: "100%", flexDirection: "row" }}
							>
								<View style={[styles.iconContainer]}>
									<FontAwesomeIcon
										icon={faFolderOpen}
										size={35}
										color={Colors.secondary}
										style={{ marginLeft: 6 }}
									/>
								</View>
								<View style={styles.textContainer}>
									<Text
										style={styles.documentName}
										numberOfLines={1}
										ellipsizeMode="tail"
									>
										{item.folderName}
									</Text>
									<Text style={styles.date}>{"Folder"}</Text>
								</View>
							</View>
						</TouchableHighlight>
						<View style={styles.actionContainer}>
							<DocumentActionMenu
								onRename={this.onOpenRenameFolderForm.bind(
									this,
									item._id,
									item.folderName
								)}
								onDelete={this.onDeleteDocument.bind(this, item._id, item.type)}
							/>
						</View>
					</>
				) : (
					<>
						<TouchableHighlight
							underlayColor={Colors.lightGrey}
							style={{ flex: 1, height: "100%" }}
							onPress={
								isPdf
									? this.openPdf.bind(this, item.fileUri, item.fileName)
									: this.openImageView.bind(this, item.fileUri, item.fileName)
							}
						>
							<View
								style={{ width: "100%", height: "100%", flexDirection: "row" }}
							>
								<View style={[styles.iconContainer]}>
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
							{typeof journeyID !== "undefined" ? (
								<TouchableHighlight
									underlayColor={Colors.lightGrey}
									style={{ padding: 5, borderRadius: 100 }}
									onPress={
										item.taggedJourney.includes(journeyID)
											? this.untagItem.bind(this, item._id)
											: this.tagItem.bind(this, item._id)
									}
								>
									<FontAwesomeIcon
										size={17}
										icon={
											item.taggedJourney.includes(journeyID)
												? faStarSolid
												: faStarLight
										}
										color={Colors.secondary}
									/>
								</TouchableHighlight>
							) : null}

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
								onDelete={this.onDeleteDocument.bind(this, item._id, item.type)}
							/>
						</View>
					</>
				)}
			</View>
		);
	};

	keyExtractor = (item: any) => item._id;

	getListEmptyComponent = () => {
		const { userData } = this.context;
		return userData === null ? (
			<SignInRequired />
		) : (
			<NoResult
				title={"No Documents Found"}
				// style={{ flex: 0.6 }}
				titleStyle={{ fontSize: 16 }}
			/>
		);
	};

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

	openModal = () => {
		this.setState({ isFolderModalOpen: true });
		this.filepickermodal && this.filepickermodal.current?.close();
	};

	closeModal = () => {
		this.setState({ isFolderModalOpen: false });
	};

	onCreateFolder = (values: FormModel2) => {
		const { userData } = this.context;

		let reqData = {
			folderName: values.folderName,
			customerId: userData?._id,
		};

		this.setState({ isLoading: true, isFolderModalOpen: false }, () => {
			MyDocService.createFolder(reqData)
				.then((response) => {
					this.setState({ isLoading: false }, () => {
						this.loadDocuments();
						setTimeout(() => {
							Snackbar.show({
								text: response.message,
								duration: Snackbar.LENGTH_LONG,
							});
						}, 500);
					});
				})
				.catch((error) => {
					this.setState({ isLoading: false });
				});
		});
	};

	render = () => {
		const allDocuments = this.getDocuments();
		return (
			<Container>
				<Header title={LocalizedText.MY_DOCUMENTS} />
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

				{/* <FabButton icon={faPlus} onPress={this.openModal} /> */}
				{typeof this.props.route.params?.type === "undefined" ? (
					<>
						<FabButton icon={faPlus} onPress={this.openFilePicker} />
						<FilePickerModal
							ref={this.filepickermodal}
							onSelectImage={this.onSelectImage}
							onCaptureImage={this.onCaptureImage}
							onSelectDocument={this.onSelectDocument}
							onOpenFolderModal={this.openModal}
						/>
					</>
				) : null}

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

				<BottomSheet
					isVisible={this.state.isFolderRenameModalOpen}
					title={"Rename Folder"}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.onCloseRenameFolderForm}
				>
					<View style={{ padding: 20 }}>
						<Formik
							initialValues={{ folderId: "", folderName: "" }}
							validationSchema={folderRenameValidationSchema}
							onSubmit={this.onRenameFolder}
							innerRef={this.formikRef3}
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
										label={"Folder Name"}
										value={values.folderName}
										autoCapitalize="words"
										onChangeText={handleChange("folderName")}
										onBlur={handleBlur("folderName")}
										error={touched.folderName ? errors.folderName : null}
									/>
									<Button
										title={LocalizedText.UPDATE}
										style={{ marginTop: 30, width: "100%" }}
										onPress={() => handleSubmit()}
									/>
								</>
							)}
						</Formik>
					</View>
				</BottomSheet>

				<Modal
					animationType="slide"
					transparent={true}
					visible={this.state.isFolderModalOpen}
					onRequestClose={this.closeModal}
				>
					<View style={styles.folderModalBackground}>
						<View style={styles.folderAlertBox}>
							<Text style={styles.folderTitle}>{"New Folder"}</Text>

							<Formik
								initialValues={{ folderName: "" }}
								validationSchema={folderValidationSchema}
								onSubmit={this.onCreateFolder}
								innerRef={this.formikRef2}
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
											label={"Folder Name"}
											value={values.folderName}
											autoCapitalize="words"
											onChangeText={handleChange("folderName")}
											onBlur={handleBlur("folderName")}
											error={touched.folderName ? errors.folderName : null}
										/>

										<View style={[styles.buttonContainer, { marginTop: 30 }]}>
											<TouchableOpacity
												style={styles.cancelButton}
												onPress={this.closeModal}
											>
												<Text style={styles.cancelButtonText}>
													{LocalizedText.BACK}
												</Text>
											</TouchableOpacity>
											<TouchableOpacity
												activeOpacity={0.9}
												style={styles.button}
												onPress={() => handleSubmit()}
											>
												<Text style={styles.buttonText}>{"Create"}</Text>
											</TouchableOpacity>
										</View>
									</>
								)}
							</Formik>
						</View>
					</View>
				</Modal>

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
	searchContainer: {
		width: "93%",
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 30,
		paddingHorizontal: 6,
		marginBottom: 8,
	},
	searchIconBox: {
		width: "8%",
		alignItems: "center",
		justifyContent: "center",
	},
	searchField: {
		height: 38,
		width: "82%",
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	cancelButton: {
		flex: 1,
		padding: 10,
		// marginHorizontal: 5,
		marginRight: 5,
		borderWidth: 1,
		borderRadius: 5,
		borderColor: Colors.primaryBg,
	},
	cancelButtonText: {
		color: Colors.primaryBg,
		textAlign: "center",
		fontSize: 16,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
	},
	button: {
		flex: 1,
		padding: 10,
		// marginHorizontal: 5,
		marginLeft: 5,
		borderRadius: 5,
		backgroundColor: Colors.primaryBg,
	},
	buttonText: {
		color: Colors.white,
		textAlign: "center",
		fontSize: 16,
	},
	folderModalBackground: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	folderAlertBox: {
		width: 350,
		padding: 20,
		backgroundColor: Colors.white,
		borderRadius: 10,
		// alignItems: "center",
	},
	folderTitle: {
		fontSize: 20,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		marginBottom: 10,
		color: Colors.lightFont,
		alignSelf: "center",
	},
	folderTextInput: {
		height: 50,
		width: "97%",
		borderRadius: 6,
		borderColor: Colors.lightBorder,
		fontSize: 14,
		color: Colors.secondaryFont,
		opacity: 0.7,
		borderWidth: 1,
		marginTop: 10,
		paddingLeft: 10,
	},
	errorText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.danger,
		marginTop: 3,
	},
});
