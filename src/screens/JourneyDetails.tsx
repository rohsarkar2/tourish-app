import React from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert,
	BackHandler,
	Keyboard,
} from "react-native";
import Snackbar from "react-native-snackbar";
import { Formik } from "formik";
import * as Yup from "yup";
import RNFS from "react-native-fs";
import FileViewer from "react-native-file-viewer";
import {
	Container,
	WhiteContainer,
	Header,
	OverlayLoader,
	BottomSheet,
	Button,
	ImageViewer,
} from "../components";
import LocalizedText from "../resources/LocalizedText";
import JourneyActivities from "./tour-tabs/JourneyActivities";
import JourneyDocuments from "./tour-tabs/JourneyDocuments";
import JourneyProducts from "./tour-tabs/JourneyProducts";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";
import TourBookService from "../services/TourBookService";
import { JourneyDetailsScreenProps } from "../navigation/NavigationTypes";
import AppContext from "../context/AppContext";
import InputField from "../components/InputField";

const validationSchema = Yup.object().shape({
	journeyName: Yup.string().required(LocalizedText.ENTER_TOUR_BOOK_TITLE),
});

type States = {
	journeyID: string;
	journeyTitle: string;
	tabIndex: number;
	activities: Array<any>;
	documents: Array<any>;
	products: Array<any>;
	isLoading: boolean;
	isSubmitting: boolean;
	isModalOpen: boolean;
};

export default class JourneyDetails extends React.Component<
	JourneyDetailsScreenProps,
	States
> {
	static contextType = AppContext;
	declare context: React.ContextType<typeof AppContext>;
	private imageViewerRef: React.RefObject<any>;
	private backHandler: any;
	private focusListner: any;

	constructor(props: JourneyDetailsScreenProps) {
		super(props);

		this.state = {
			journeyID: this.props.route.params.journeyID,
			journeyTitle: this.props.route.params.journeyTitle,
			// tabIndex: 1,
			tabIndex:
				typeof this.props.route.params !== "undefined"
					? this.props.route.params.tabIndex
					: 1,
			documents: [],
			activities: [],
			products: [],
			isModalOpen: false,
			isLoading: true,
			isSubmitting: false,
		};

		this.imageViewerRef = React.createRef();
	}

	componentDidMount = () => {
		this.backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			this.onBackButtonPress
		);

		this.focusListner = this.props.navigation.addListener(
			"focus",
			this.onFocusScreen
		);
	};

	componentWillUnmount() {
		this.backHandler.remove();
		this.focusListner();
	}

	onBackButtonPress = () => {
		this.props.navigation.navigate("Journey");
		return true;
	};

	onFocusScreen = () => {
		let { tabIndex } = this.state;
		if (tabIndex === 1) {
			this.setState({ isLoading: true }, () => {
				TourBookService.getActivities(this.state.journeyID)
					.then((data) => {
						this.setState({ isLoading: false, activities: data });
					})
					.catch((error) => {
						this.setState({ isLoading: false });
					});
			});
		} else if (tabIndex === 2) {
			TourBookService.getDocs(this.state.journeyID)
				.then((data) => {
					this.setState({ isLoading: false, documents: data });
				})
				.catch((error) => {
					this.setState({ isLoading: false });
				});
		} else {
			TourBookService.getProducts(this.state.journeyID)
				.then((data) => {
					this.setState({ isLoading: false, products: data });
				})
				.catch((error) => {
					this.setState({ isLoading: false });
				});
		}
	};

	setTabIndex = (index: number) => {
		this.setState({ tabIndex: index, isLoading: true }, () => {
			let { tabIndex } = this.state;
			if (tabIndex === 1) {
				TourBookService.getActivities(this.state.journeyID)
					.then((data) => {
						this.setState({ isLoading: false, activities: data });
					})
					.catch((error) => {
						this.setState({ isLoading: false });
					});
			} else if (tabIndex === 2) {
				TourBookService.getDocs(this.state.journeyID)
					.then((data) => {
						this.setState({ isLoading: false, documents: data });
					})
					.catch((error) => {
						this.setState({ isLoading: false });
					});
			} else {
				TourBookService.getProducts(this.state.journeyID)
					.then((data) => {
						this.setState({ isLoading: false, products: data });
					})
					.catch((error) => {
						this.setState({ isLoading: false });
					});
			}
		});
	};

	onProductsRefresh = () => {
		this.setState({ isLoading: true }, () => {
			TourBookService.getProducts(this.state.journeyID)
				.then((data) => {
					this.setState({ isLoading: false, products: data });
				})
				.catch((error) => {
					this.setState({ isLoading: false });
				});
		});
	};

	uploadJourneyDocument = (reqData: any) => {
		let formData = new FormData();
		formData.append("journey_id", this.state.journeyID);
		formData.append("attachment_type", reqData.attachment_type);
		formData.append("attachment_name", reqData.attachment_name);
		formData.append("attachment", reqData.attachment);

		this.setState({ isSubmitting: true }, () => {
			TourBookService.addDoc(formData)
				.then((response) => {
					if (response.check) {
						let journeyDocs = this.state.documents;
						journeyDocs.push({
							type: reqData.attachment_type,
							name: reqData.attachment_name,
							file: reqData.attachment.name,
							uri: reqData.attachment.uri,
						});

						this.setState({
							isSubmitting: false,
							documents: journeyDocs,
						});
					} else {
						this.setState({ isSubmitting: false });
						Alert.alert(LocalizedText.ERROR, response.message);
					}
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	onDeleteActivity = (activityId: string, cityId: string) => {
		this.setState({ isSubmitting: true }, () => {
			const reqData = {
				journey_id: this.state.journeyID,
				activity_id: activityId,
			};

			TourBookService.deleteActivity(reqData)
				.then((response) => {
					const { activities } = this.state;
					let modActivities: any[] = [];
					const activityByCities: any[] = activities.filter(
						(item: any) => item.city_id === cityId
					);

					if (activityByCities.length === 1) {
						const activityData: any = activityByCities[0];
						const modActivityData: any = {
							_id: activityData._id,
							city_id: activityData.city_id,
							city_name: activityData.city_name,
							activity_name: null,
							activity_slug: null,
							datetime: null,
							attachments: [],
						};

						modActivities = [...activities];
						const index: number = modActivities.findIndex(
							(item: any) => item._id === activityId
						);
						if (index > -1) {
							modActivities[index] = modActivityData;
						}
					} else {
						modActivities = activities.filter(
							(item: any) => item._id !== activityId
						);
					}

					this.setState({
						isSubmitting: false,
						activities: modActivities,
					});
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	uploadActivityAttachment = (reqData: any) => {
		const activityID = reqData.activity_id;
		let formData = new FormData();
		formData.append("journey_id", this.state.journeyID);
		formData.append("activity_id", activityID);
		formData.append("attachment_name", reqData.attachment_name);
		formData.append("attachment", reqData.attachment);

		this.setState({ isSubmitting: true }, () => {
			TourBookService.addActivityAttachment(formData)
				.then((response) => {
					let journeyActivities = this.state.activities;
					let index = journeyActivities.findIndex(
						(item) => item._id === activityID
					);

					if (index > -1) {
						let attachments = journeyActivities[index].attachments;
						attachments.push(response.data);
						journeyActivities[index].attachments = attachments;

						this.setState({
							isSubmitting: false,
							activities: journeyActivities,
						});
					} else {
						this.setState({ isSubmitting: false });
						Alert.alert(LocalizedText.FAILED, "Activity not found");
					}
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	onAddLocation = (
		cityName: string,
		cityId: undefined | string
	): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.setState({ isSubmitting: true }, () => {
					let reqData: any = {
						city_name: cityName,
						journey_id: this.state.journeyID,
					};
					if (typeof cityId !== "undefined") {
						reqData.city_id = cityId;
					}
					TourBookService.addLocation(reqData)
						.then((response) => {
							let journeyActivities = this.state.activities;
							journeyActivities.push(response.data);

							this.setState(
								{
									isSubmitting: false,
									activities: journeyActivities,
								},
								() => {
									resolve(true);
								}
							);
						})
						.catch((error) => {
							this.setState({ isSubmitting: false }, () => {
								reject(false);
							});
						});
				});
			}, 300);
		});
	};

	onEditLocation = (
		cityName: string,
		oldCityId: string,
		newCityId: undefined | string
	): Promise<boolean> => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				this.setState({ isSubmitting: true }, () => {
					const reqData: any = {
						journey_id: this.state.journeyID,
						old_city_id: oldCityId,
						new_city_name: cityName,
					};

					if (typeof newCityId !== "undefined") {
						reqData.new_city_id = newCityId;
					}

					TourBookService.editLocation(reqData)
						.then((response) => {
							const { activities } = this.state;
							const resData: any = response.data;

							const modActivities: any[] = activities.map((item: any) => {
								if (item.city_id === oldCityId) {
									item.city_id = resData.cityId;
									item.city_name = cityName;
								}
								return item;
							});

							this.setState(
								{ isSubmitting: false, activities: modActivities },
								() => {
									resolve(true);
								}
							);
						})
						.catch((error) => {
							this.setState({ isSubmitting: false }, () => {
								reject(false);
							});
						});
				});
			}, 300);
		});
	};

	onDeleteLocation = (cityId: string) => {
		setTimeout(() => {
			this.setState({ isSubmitting: true }, () => {
				const reqData: any = {
					journey_id: this.state.journeyID,
					city_id: cityId,
				};

				TourBookService.deleteLocation(reqData)
					.then((response) => {
						const { activities } = this.state;
						const modActivities: any[] = activities.filter(
							(item: any) => item.city_id !== cityId
						);

						this.setState({ isSubmitting: false, activities: modActivities });
					})
					.catch((error) => {
						this.setState({ isSubmitting: false });
					});
			});
		}, 300);
	};

	onRemoveActivityAttachment = (activityID: string, filename: string) => {
		const { journeyID, activities } = this.state;
		this.setState({ isSubmitting: true }, () => {
			const reqData = {
				journey_id: journeyID,
				activity_id: activityID,
				filename: filename,
			};

			TourBookService.deleteActivityAttachment(reqData)
				.then((response: any) => {
					const index = activities.findIndex((item) => item._id === activityID);
					if (index > -1) {
						const activityData = { ...activities[index] };
						const attachments = activityData.attachments || [];
						const modAttachments = attachments.filter(
							(element: any) => element.file !== filename
						);

						activityData.attachments = modAttachments;
						activities[index] = activityData;
						this.setState({ activities, isSubmitting: false });
					}
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	onRemoveDocument = (docType: string, filename: string) => {
		const { journeyID, documents } = this.state;
		this.setState({ isSubmitting: true }, () => {
			const reqData = {
				journey_id: journeyID,
				fileName: filename,
			};

			TourBookService.deleteDocument(reqData)
				.then((response) => {
					const modDocuments = documents.filter(
						(item: any) => item.type !== docType && item.file !== filename
					);

					this.setState({ documents: modDocuments, isSubmitting: false });
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	openEditModal = () => {
		this.setState({ isModalOpen: true });
	};

	closeEditModal = () => {
		Keyboard.dismiss();
		this.setState({ isModalOpen: false });
	};

	onHandleValidation = (callback: Function) => {
		callback();
	};

	onEditTourBookTitle = (values: any) => {
		Keyboard.dismiss();
		this.setState({ isSubmitting: true }, () => {
			const reqData = {
				journeyId: this.state.journeyID,
				name: values.journeyName,
			};

			TourBookService.update(reqData)
				.then((response: any) => {
					this.setState(
						{
							isSubmitting: false,
							isModalOpen: false,
							journeyTitle: values.journeyName,
						},
						() => {
							setTimeout(() => {
								Snackbar.show({
									text: response.message,
									duration: Snackbar.LENGTH_LONG,
								});
							}, 500);
						}
					);
				})
				.catch((error) => {
					this.setState({ isSubmitting: false });
				});
		});
	};

	onDeleteTourBook = () => {
		Alert.alert(
			LocalizedText.DELETE_TOUR,
			LocalizedText.DELETE_TOUR_ALERT_MESSAGE,
			[
				{ text: LocalizedText.NO, style: "cancel" },
				{
					text: LocalizedText.YES,
					onPress: () => {
						this.setState({ isSubmitting: true }, () => {
							const reqData = {
								journeyId: this.state.journeyID,
								customerId: this.context.userData?._id,
							};

							TourBookService.delete(reqData)
								.then((response: any) => {
									this.setState({ isSubmitting: false }, () => {
										setTimeout(() => {
											Snackbar.show({
												text: response.message,
												duration: Snackbar.LENGTH_LONG,
											});
											this.props.navigation.navigate("Journey");
										}, 500);
									});
								})
								.catch((error) => {
									this.setState({ isSubmitting: false });
								});
						});
					},
				},
			]
		);
	};

	onOpenPdf = (url: string) => {
		this.setState({ isSubmitting: true }, () => {
			const uriSegments: string[] = url.split("/");
			const filename: string = uriSegments[uriSegments.length - 1];
			const temPath: string = `${RNFS.TemporaryDirectoryPath}/${filename}`;
			const options = {
				fromUrl: url,
				toFile: temPath,
			};

			RNFS.downloadFile(options)
				.promise.then(() => {
					this.setState({ isSubmitting: false }, () => {
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
					this.setState({ isSubmitting: false });
				});
		});
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

	onOpenImage = (url: string) => {
		this.imageViewerRef && this.imageViewerRef.current?.open(url);
	};

	render = () => {
		return (
			<Container>
				<Header
					title={this.state.journeyTitle}
					onBackAction={this.onBackButtonPress}
					onEditTour={this.openEditModal}
					onDeleteTour={this.onDeleteTourBook}
				/>
				<WhiteContainer style={styles.whiteContainer}>
					<View style={styles.tabContainer}>
						<TouchableOpacity
							activeOpacity={this.state.tabIndex === 1 ? 1 : 0.6}
							onPress={
								this.state.tabIndex === 1
									? undefined
									: this.setTabIndex.bind(this, 1)
							}
							style={[
								styles.tab,
								{ borderTopLeftRadius: 30 },
								this.state.tabIndex === 1 ? styles.activeTab : null,
							]}
						>
							<Text
								style={
									this.state.tabIndex === 1
										? styles.activeTabText
										: styles.tabText
								}
							>
								{LocalizedText.ACTIVITIES}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							activeOpacity={this.state.tabIndex === 2 ? 1 : 0.6}
							onPress={
								this.state.tabIndex === 2
									? undefined
									: this.setTabIndex.bind(this, 2)
							}
							style={[
								styles.tab,
								this.state.tabIndex === 2 ? styles.activeTab : null,
							]}
						>
							<Text
								style={
									this.state.tabIndex === 2
										? styles.activeTabText
										: styles.tabText
								}
							>
								{LocalizedText.DOCUMENTS}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							activeOpacity={this.state.tabIndex === 3 ? 1 : 0.6}
							onPress={
								this.state.tabIndex === 3
									? undefined
									: this.setTabIndex.bind(this, 3)
							}
							style={[
								styles.tab,
								{ borderTopRightRadius: 30 },
								this.state.tabIndex === 3 ? styles.activeTab : null,
							]}
						>
							<Text
								style={
									this.state.tabIndex === 3
										? styles.activeTabText
										: styles.tabText
								}
							>
								{LocalizedText.PRODUCTS}
							</Text>
						</TouchableOpacity>
					</View>

					{this.state.tabIndex === 1 ? (
						<JourneyActivities
							isLoading={this.state.isLoading}
							journeyID={this.state.journeyID}
							activities={this.state.activities}
							navigation={this.props.navigation}
							onAddLocation={this.onAddLocation}
							onEditLocation={this.onEditLocation}
							onDeleteLocation={this.onDeleteLocation}
							onDeleteActivity={this.onDeleteActivity}
							onAddAttachment={this.uploadActivityAttachment}
							onRemoveActivityAttachment={this.onRemoveActivityAttachment}
							onOpenPdf={this.onOpenPdf}
							onOpenImage={this.onOpenImage}
						/>
					) : this.state.tabIndex === 2 ? (
						<JourneyDocuments
							isLoading={this.state.isLoading}
							journeyID={this.state.journeyID}
							documents={this.state.documents}
							navigation={this.props.navigation}
							onUploadFile={this.uploadJourneyDocument}
							onRemoveDocument={this.onRemoveDocument}
							onOpenPdf={this.onOpenPdf}
							onOpenImage={this.onOpenImage}
						/>
					) : (
						<JourneyProducts
							isLoading={this.state.isLoading}
							journeyID={this.state.journeyID}
							products={this.state.products}
							navigation={this.props.navigation}
							onRefresh={this.onProductsRefresh}
						/>
					)}
				</WhiteContainer>

				<BottomSheet
					isVisible={this.state.isModalOpen}
					title={LocalizedText.EDIT_TOUR_BOOK_TITLE}
					style={{ height: Math.floor(Constant.WINDOW_HEIGHT * 0.6) }}
					onClose={this.closeEditModal}
				>
					<View style={styles.modalBody}>
						<Formik
							initialValues={{ journeyName: `${this.state.journeyTitle}` }}
							validationSchema={validationSchema}
							onSubmit={this.onEditTourBookTitle}
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
										value={values.journeyName}
										label={LocalizedText.TOUR_BOOK_TITLE}
										autoCapitalize="words"
										onChangeText={handleChange("journeyName")}
										onBlur={handleBlur("journeyName")}
										error={touched.journeyName ? errors.journeyName : null}
									/>
									<Button
										title={LocalizedText.SUBMIT}
										style={styles.submitBtn}
										onPress={this.onHandleValidation.bind(this, handleSubmit)}
									/>
								</>
							)}
						</Formik>
					</View>
				</BottomSheet>
				<ImageViewer ref={this.imageViewerRef} />
				<OverlayLoader visible={this.state.isSubmitting} />
			</Container>
		);
	};
}

const styles = StyleSheet.create({
	whiteContainer: {
		paddingHorizontal: 0,
		paddingTop: 0,
	},
	tabContainer: {
		width: "100%",
		height: 50,
		flexDirection: "row",
	},
	tab: {
		flex: 1,
		height: 50,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		alignItems: "center",
		justifyContent: "center",
	},
	activeTab: {
		borderBottomWidth: 2,
		borderBottomColor: Colors.primaryBtn,
	},
	tabText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 0.8,
	},
	activeTabText: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 14,
		color: Colors.primaryFont,
		opacity: 1,
	},
	modalBody: {
		padding: 20,
	},
	submitBtn: {
		marginTop: 30,
		width: "100%",
	},
});
