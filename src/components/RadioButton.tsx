import React from "react";
import {
	TouchableOpacity,
	Text,
	StyleSheet,
	ViewStyle,
	TextStyle,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircle } from "@fortawesome/pro-regular-svg-icons/faCircle";
import { faCircleDot } from "@fortawesome/pro-regular-svg-icons/faCircleDot";
import Colors from "../configs/Colors";

type Props = {
	isChecked: boolean;
	label: string;
	onPress: () => void;
	style?: null | ViewStyle | Array<ViewStyle>;
	labelStyle?: null | TextStyle | Array<TextStyle>;
};

export default class RadioButton extends React.Component<Props> {
	render = () => (
		<TouchableOpacity
			activeOpacity={1}
			style={[styles.container, this.props.style]}
			onPress={this.props.onPress}
		>
			<FontAwesomeIcon
				icon={this.props.isChecked ? faCircleDot : faCircle}
				size={14}
				color={this.props.isChecked ? Colors.primaryBtn : Colors.secondaryFont}
			/>

			<Text style={[styles.radioText, this.props.labelStyle]}>
				{this.props.label}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		flexDirection: "row",
		padding: 3,
	},
	radioText: {
		fontSize: 14,
		color: Colors.primaryFont,
		fontWeight: "400",
		lineHeight: 22,
		marginLeft: 5,
	},
});
