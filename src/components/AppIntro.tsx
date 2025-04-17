import React from "react";
import { StyleSheet, Text, View, Image, Dimensions } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import Colors from "../configs/Colors";

type States = {
	showRealApp: boolean;
	introSlides: any[];
};

export default class AppIntro extends React.Component<any, States> {
	constructor(props: any) {
		super(props);

		this.state = {
			showRealApp: false,
			introSlides: [
				{
					key: "intro1",
					title: "Travel Globally",
					text: "Ease of access to travel services globally",
					image: require("../assets/images/intro1.png"),
					backgroundColor: Colors.white,
				},
				{
					key: "intro2",
					title: "Your Tour Book",
					text: "The place for all your travel documents",
					image: require("../assets/images/intro2.png"),
					backgroundColor: Colors.white,
				},
				{
					key: "intro3",
					title: "Support",
					text: "Whenever you need us",
					image: require("../assets/images/intro3.png"),
					backgroundColor: Colors.white,
				},
			],
		};
	}

	renderItem = ({ item }: any): JSX.Element => {
		return (
			<View style={styles.introSlideContainer}>
				<View style={styles.imageContainer}>
					<Image
						source={item.image}
						style={styles.image}
						resizeMode="contain"
					/>
				</View>
				<View>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.desc}>{item.text}</Text>
				</View>
			</View>
		);
	};

	nextButton = (): JSX.Element => <Text style={styles.textBtn}>NEXT</Text>;

	doneButton = (): JSX.Element => <Text style={styles.textBtn}>DONE</Text>;

	render = (): JSX.Element => (
		<AppIntroSlider
			renderItem={this.renderItem}
			data={this.state.introSlides}
			onDone={this.props.onDone}
			showSkipButton={false}
			showNextButton={true}
			renderNextButton={this.nextButton}
			renderDoneButton={this.doneButton}
			activeDotStyle={{
				backgroundColor: Colors.secondary,
			}}
		/>
	);
}

const winWidth = Dimensions.get("window").width;
const winHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
	introSlideContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "space-evenly",
		backgroundColor: Colors.white,
	},
	imageContainer: {
		width: winWidth,
		height: Math.floor(winHeight * 0.6),
	},
	image: {
		width: "100%",
		height: "100%",
	},
	title: {
		fontSize: 25,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.primaryFont,
		textAlign: "center",
		marginBottom: 5,
	},
	desc: {
		fontSize: 14,
		fontFamily: "Roboto-Light",
		fontWeight: "300",
		color: Colors.secondaryFont,
		textAlign: "center",
	},
	textBtn: {
		fontSize: 16,
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		marginTop: 12,
	},
});
