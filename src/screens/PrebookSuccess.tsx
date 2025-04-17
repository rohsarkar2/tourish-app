import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-solid-svg-icons/faCircleCheck";
import { PrebookSuccessScreenProps } from "../navigation/NavigationTypes";
import { Button, Container, Header, WhiteContainer } from "../components";
import Colors from "../configs/Colors";
import { CommonActions } from "@react-navigation/native";

const PrebookSuccess: React.FC<PrebookSuccessScreenProps> = (
	props: PrebookSuccessScreenProps
): React.ReactElement => {
	const gotoHome = () => {
		props.navigation.dispatch(
			CommonActions.reset({
				index: 0,
				routes: [
					{
						name: "HomeTab",
						params: { screen: "Home" },
					},
				],
			})
		);
	};

	const onOpenTourList = () => {};

	const gotoMyPrebook = () => {};

	return (
		<Container>
			{/* <Header /> */}
			<WhiteContainer
				style={{ alignItems: "center", justifyContent: "center" }}
			>
				<View style={{ flex: 1, width: "100%" }}>
					<View
						style={{
							flex: 1,
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<FontAwesomeIcon
							icon={faCircleCheck}
							size={70}
							color={Colors.success}
							style={{ marginBottom: 30 }}
						/>
						<Text style={styles.heading}>{"Prebook Success"}</Text>
						<Text style={[styles.subText, { fontSize: 14 }]}>
							{"Please collect your item from respective location."}
						</Text>
						<View style={[styles.devider, { marginTop: 30 }]} />
						<View style={{ width: "100%", paddingVertical: 15 }}>
							<View style={[styles.infoRow, { paddingBottom: 5 }]}>
								<Text style={[styles.subText, { fontSize: 14 }]}>
									{"Confirmation No."}
								</Text>
								<Text style={[styles.subText, { fontSize: 14 }]}>
									{"2022246518"}
								</Text>
							</View>
							<View style={[styles.infoRow, { paddingTop: 5 }]}>
								<Text style={styles.loadingText}>{"Amount to be Paid"}</Text>
								<Text
									style={styles.loadingText}
								>{`USD ${props.route.params.amount}`}</Text>
							</View>
						</View>
					</View>

					<View
						style={{
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Button
							title="Add to Tour Book"
							style={{ marginTop: 20, marginBottom: 10 }}
							onPress={onOpenTourList}
						/>
						<Button
							title="My Prebook"
							style={{
								marginVertical: 10,
								backgroundColor: Colors.white,
								borderWidth: 1,
								borderColor: Colors.primaryBtn,
							}}
							titleStyle={{ color: Colors.primaryBtn }}
							onPress={gotoMyPrebook}
						/>
						<TouchableOpacity
							style={{ marginTop: 10, marginBottom: 20 }}
							onPress={gotoHome}
						>
							<Text
								style={[
									styles.boldText,
									{ color: Colors.secondary, textAlign: "center" },
								]}
							>
								{"Explore More"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</WhiteContainer>
		</Container>
	);
};

export default PrebookSuccess;

const styles = StyleSheet.create({
	loadingText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		opacity: 0.9,
	},
	subText: {
		fontSize: 12,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		opacity: 0.7,
	},
	heading: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 22,
		color: Colors.secondaryFont,
		opacity: 0.9,
		marginBottom: 5,
	},
	devider: {
		height: 1,
		width: "100%",
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	gotoHomeBtn: {
		height: 45,
		width: "80%",
		marginTop: 40,
		borderWidth: 1,
		backgroundColor: "transparent",
		borderColor: Colors.primaryBtn,
	},
	boldText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.primaryFont,
		opacity: 0.9,
		lineHeight: 21,
	},
	lightText: {
		fontSize: 12,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		opacity: 0.8,
		lineHeight: 18,
	},
});
