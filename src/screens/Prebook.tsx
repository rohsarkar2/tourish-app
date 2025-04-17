import React, { useContext, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import DropDownPicker from "react-native-dropdown-picker";
import { PrebookScreenProps } from "../navigation/NavigationTypes";
import {
	Button,
	Container,
	Datepicker,
	Header,
	InputField,
	WhiteContainer,
} from "../components";
import Colors from "../configs/Colors";
import moment from "moment";
import DropdownPicker from "../components/DropdownPicker";
import WishlistContext from "../context/WishlistContext";

const counters: Array<any> = [
	{ label: "Counter 1", value: "Counter 1" },
	{ label: "Counter 2", value: "Counter 2" },
	{ label: "Counter 3", value: "Counter 3" },
	{ label: "Counter 4", value: "Counter 4" },
	{ label: "Counter 5", value: "Counter 5" },
	{ label: "Counter 6", value: "Counter 6" },
	{ label: "Counter 7", value: "Counter 7" },
	{ label: "Counter 8", value: "Counter 8" },
	{ label: "Counter 9", value: "Counter 9" },
];

const terminals: Array<any> = [
	{ label: "Terminal Arrival 1", value: "Terminal Arrival 1" },
	{ label: "Terminal Arrival 2", value: "Terminal Arrival 2" },
	{ label: "Terminal Arrival 3", value: "Terminal Arrival 3" },
	{ label: "Terminal Arrival 4", value: "Terminal Arrival 4" },
];

const FinalDestinations: Array<any> = [
	{ label: "India", value: "India" },
	{ label: "United Stated of America", value: "United Stated of America" },
	{ label: "France", value: "France" },
	{ label: "Indonesia", value: "Indonesia" },
	{ label: "United Kingdom", value: "United Kingdom" },
];

const validationSchema = Yup.object().shape({
	pickupCounter: Yup.string().required("Pickup Counter is required"),
	terminal: Yup.string().required("Terminal is required"),
	collectionDate: Yup.string().required("Select a date"),
	airlineName: Yup.string().required("Airline Name is required"),
	flightNumber: Yup.string().required("Flight Number is required"),
	finalDestination: Yup.string().required("Final Destination is required"),
});

type FormModel = {
	pickupCounter: string;
	terminal: string;
	collectionDate: string;
	airlineName: string;
	flightNumber: string;
	finalDestination: string;
};

const Prebook: React.FC<PrebookScreenProps> = (
	props: PrebookScreenProps
): React.ReactElement => {
	const context2 = useContext(WishlistContext);
	const formikRef = useRef<FormikProps<FormModel>>(null);
	const [date, setDate] = useState<null | string>(null);
	const [isPickupCounterDropdownOpen, setIsPickupCounterDropdownOpen] =
		useState<boolean>(false);
	const [selectedPickupCounter, setSelectedPickupCounter] = useState<
		null | string
	>(null);
	const [isTerminalDropdownOpen, setIsTerminalDropdownOpen] =
		useState<boolean>(false);
	const [selectedTerminal, setSelectedTerminal] = useState<null | string>(null);
	const [isFinalDestinationDropdownOpen, setIsFinalDestinationDropdownOpen] =
		useState<boolean>(false);
	const [selectedFinalDestination, setSelectedFinalDestination] = useState<
		null | string
	>(null);

	const togglePickupCounterDropdown = () => {
		setIsPickupCounterDropdownOpen(!isPickupCounterDropdownOpen);
	};

	const onChangePickupCounter = (item: any) => {
		setSelectedPickupCounter(item);
		formikRef && formikRef.current?.setFieldValue("pickupCounter", item());
	};

	const toggleTerminalDropdown = () => {
		setIsTerminalDropdownOpen(!isTerminalDropdownOpen);
	};

	const onChangeTerminal = (item: any) => {
		setSelectedTerminal(item);
		formikRef && formikRef.current?.setFieldValue("terminal", item());
	};

	const toggleFinalDestinationDropdown = () => {
		setIsFinalDestinationDropdownOpen(!isFinalDestinationDropdownOpen);
	};

	const onChangeFinalDestination = (item: any) => {
		setSelectedFinalDestination(item);
		formikRef && formikRef.current?.setFieldValue("finalDestination", item());
	};

	const setCollectionDate = (value: string) => {
		setDate(value);
		formikRef && formikRef.current?.setFieldValue("collectionDate", value);
	};

	const onChangeAirlineName = (str: string) => {
		formikRef && formikRef.current?.setFieldValue("airlineName", str);
	};
	const onChangeFlightNumber = (str: string) => {
		formikRef && formikRef.current?.setFieldValue("flightNumber", str);
	};

	const onConfirm = (values: FormModel) => {
		props.navigation.navigate("PrebookSuccess", {
			amount: props.route.params.amount,
		});
		context2.clearWishlist();
	};

	return (
		<Container>
			<Header title={"Pre-book"} />
			<WhiteContainer style={{ paddingTop: 20, paddingHorizontal: 20 }}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					nestedScrollEnabled={true}
				>
					<View style={{ width: "100%" }}>
						<Formik
							innerRef={formikRef}
							initialValues={{
								pickupCounter: "",
								terminal: "",
								collectionDate: "",
								airlineName: "",
								flightNumber: "",
								finalDestination: "",
							}}
							// validationSchema={validationSchema}
							onSubmit={onConfirm}
						>
							{({
								handleChange,
								handleBlur,
								handleSubmit,
								touched,
								errors,
								values,
								resetForm,
							}) => (
								<>
									<Text style={styles.label}>{"Pick up Counter"}</Text>
									<DropdownPicker
										open={isPickupCounterDropdownOpen}
										value={selectedPickupCounter}
										items={counters}
										setOpen={togglePickupCounterDropdown}
										setValue={onChangePickupCounter}
										zIndex={99999}
										placeholder="Select a pickup counter..."
										error={
											touched.pickupCounter && errors.pickupCounter
												? errors.pickupCounter
												: null
										}
									/>
									{touched.pickupCounter && errors.pickupCounter ? (
										<Text style={styles.errorText}>{errors.pickupCounter}</Text>
									) : null}

									<Text style={[styles.label, { marginTop: 15 }]}>
										{"Terminal"}
									</Text>
									<DropdownPicker
										open={isTerminalDropdownOpen}
										value={selectedTerminal}
										items={terminals}
										setOpen={toggleTerminalDropdown}
										setValue={onChangeTerminal}
										zIndex={9999}
										placeholder="Select a terminal..."
										error={
											touched.terminal && errors.terminal
												? errors.terminal
												: null
										}
									/>

									{touched.terminal && errors.terminal ? (
										<Text style={styles.errorText}>{errors.terminal}</Text>
									) : null}

									<Text
										style={[styles.label, { marginTop: 15, marginBottom: 10 }]}
									>
										{"Collection Date"}
									</Text>

									<Datepicker
										label="Select Collection Date"
										value={date}
										minimumDate={moment(new Date()).format("YYYY-MM-DD")}
										hasError={
											(touched.collectionDate &&
												errors.collectionDate) as boolean
										}
										onDateChange={setCollectionDate}
									/>
									{touched.collectionDate && errors.collectionDate ? (
										<Text style={styles.errorText}>
											{errors.collectionDate}
										</Text>
									) : null}

									<Text style={[styles.label, { marginTop: 15 }]}>
										{"Flight Information"}
									</Text>
									{/* <View style={{ flexDirection: "row", alignItems: "center" }}> */}
									<View style={{ marginTop: 5 }}>
										<InputField
											value={values.airlineName}
											label={"Airline Name"}
											autoCapitalize="none"
											onChangeText={onChangeAirlineName}
											onBlur={handleBlur("airlineName")}
											error={touched.airlineName ? errors.airlineName : null}
										/>
									</View>
									<View style={{ marginTop: 5 }}>
										<InputField
											value={values.flightNumber}
											label={"Flight Number"}
											autoCapitalize="none"
											onChangeText={onChangeFlightNumber}
											onBlur={handleBlur("flightNumber")}
											error={touched.flightNumber ? errors.flightNumber : null}
										/>
									</View>
									{/* </View> */}

									<Text style={[styles.label, { marginTop: 15 }]}>
										{"What is your final destination?"}
									</Text>
									<DropdownPicker
										open={isFinalDestinationDropdownOpen}
										value={selectedFinalDestination}
										items={FinalDestinations}
										setOpen={toggleFinalDestinationDropdown}
										setValue={onChangeFinalDestination}
										zIndex={9999}
										placeholder="Select a final destination..."
										error={
											touched.finalDestination && errors.finalDestination
												? errors.finalDestination
												: null
										}
									/>

									{touched.finalDestination && errors.finalDestination ? (
										<Text style={styles.errorText}>
											{errors.finalDestination}
										</Text>
									) : null}

									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											marginTop: 30,
										}}
									>
										<View style={{ flex: 1, marginRight: 10 }}>
											<Button
												title={"Cancel"}
												style={styles.clearBtn}
												titleStyle={styles.clearBtnTxt}
												onPress={() => {
													resetForm();
													setSelectedPickupCounter(null);
													setSelectedTerminal(null);
													setSelectedFinalDestination(null);
													props.navigation.pop(1);
												}}
											/>
										</View>
										<View style={{ flex: 1, marginLeft: 10 }}>
											<Button
												title={"Confirm"}
												style={{ width: "100%" }}
												onPress={() => handleSubmit()}
											/>
										</View>
									</View>
								</>
							)}
						</Formik>
					</View>
				</ScrollView>
			</WhiteContainer>
		</Container>
	);
};

export default Prebook;

const styles = StyleSheet.create({
	label: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	errorText: {
		fontSize: 11,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.danger,
		marginTop: 3,
	},
	clearBtn: {
		width: "100%",
		backgroundColor: Colors.white,
		borderColor: Colors.primaryBtn,
	},
	clearBtnTxt: {
		color: Colors.primaryBtn,
	},
});
