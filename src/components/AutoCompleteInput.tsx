import React from "react";
import {
	StyleSheet,
	View,
	ActivityIndicator,
	Platform,
	TouchableHighlight,
	ViewStyle,
	FlatListProps,
	Text,
} from "react-native";
import Autocomplete from "react-native-autocomplete-input";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleXmark } from "@fortawesome/pro-solid-svg-icons/faCircleXmark";
import Colors from "../configs/Colors";
import InputField from "./InputField";

type Props = {
	data: any[];
	value: string;
	isSearching: boolean;
	hideResults: boolean;
	onChangeText: (value: string) => void;
	onClear: () => void;
	renderResultList: (
		props: FlatListProps<any>
	) => React.ReactElement<any, string | React.JSXElementConstructor<any>>;
	label?: string;
	labelPlace?: string;
	error?: null | string;
	inputContainerStyle?: ViewStyle | Array<ViewStyle>;
	listContainerStyle?: ViewStyle | Array<ViewStyle>;
	containerStyle?: ViewStyle | Array<ViewStyle>;
};

const styles = StyleSheet.create({
	inputContainer: {
		borderWidth: 0,
	},
	listContainer: {
		zIndex: 9,
		position: "absolute",
		left: 0,
		top: 53,
		width: "100%",
		backgroundColor: Colors.white,
		borderWidth: 0,
		...Platform.select({
			android: {
				elevation: 5,
			},
			ios: {
				shadowColor: Colors.shadowColor,
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 1,
				shadowRadius: 2,
			},
		}),
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	container: {
		flex: 0,
		zIndex: 1,
	},
	iconBox: {
		position: "absolute",
		bottom: 4,
		right: 5,
	},
	clearBtn: {
		position: "absolute",
		bottom: 0,
		right: -5,
		padding: 5,
		borderRadius: 100,
	},
});

const AutoCompleteInput: React.FC<Props> = (props) => (
	<Autocomplete
		data={props.data}
		hideResults={props.hideResults}
		inputContainerStyle={[styles.inputContainer, props.inputContainerStyle]}
		renderTextInput={(inputProps) => (
			<View style={{ width: "100%" }}>
				{props.label ? (
					<InputField
						label={props.label}
						value={props.value}
						autoCapitalize="none"
						onChangeText={props.onChangeText}
						error={props.error}
						style={{ marginBottom: 0, paddingRight: 25 }}
					/>
				) : (
					<InputField
						value={props.value}
						autoCapitalize="none"
						onChangeText={props.onChangeText}
						error={props.error}
					/>
				)}

				{props.isSearching ? (
					<View style={styles.iconBox}>
						<ActivityIndicator size="small" color={Colors.mediumGrey} />
					</View>
				) : props.value.trim().length > 0 ? (
					<TouchableHighlight
						style={styles.clearBtn}
						underlayColor={Colors.lightGrey}
						onPress={props.onClear}
					>
						<FontAwesomeIcon
							icon={faCircleXmark}
							size={18}
							color={Colors.lightFont}
						/>
					</TouchableHighlight>
				) : null}
			</View>
		)}
		listContainerStyle={[styles.listContainer, props.listContainerStyle]}
		renderResultList={props.renderResultList}
		containerStyle={[styles.container, props.containerStyle]}
	/>
);

export default AutoCompleteInput;
