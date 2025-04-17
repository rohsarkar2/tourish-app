import React from "react";
import { View, ViewStyle } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Colors from "../configs/Colors";

type Props = {
	open: boolean;
	value: null | string;
	items: Array<any>;
	setOpen: () => void;
	setValue: (item: any) => void;
	zIndex: number | undefined;
	placeholder: string;
	style?: null | ViewStyle | Array<ViewStyle>;
	error?: string | null | undefined;
};

export default class DropdownPicker extends React.Component<Props> {
	render = () => (
		<View style={{ marginHorizontal: 1 }}>
			<DropDownPicker
				open={this.props.open}
				value={this.props.value}
				items={this.props.items}
				setOpen={this.props.setOpen}
				setValue={this.props.setValue}
				zIndex={this.props.zIndex}
				placeholder={this.props.placeholder}
				listMode="SCROLLVIEW"
				containerStyle={{
					borderWidth: 0,
					marginTop: 10,
				}}
				style={[
					{
						borderRadius: 0,
						borderColor: this.props.error ? Colors.danger : Colors.lightBorder,
						borderTopWidth: 0,
						borderLeftWidth: 0,
						borderRightWidth: 0,
						paddingLeft: 0,
					},
				]}
				placeholderStyle={{
					fontFamily: "Roboto-Regular",
					fontWeight: "400",
					fontSize: 14,
					color: Colors.mediumGrey,
				}}
				dropDownContainerStyle={{
					backgroundColor: Colors.white,
					elevation: 5,
					borderColor: Colors.white,
					marginTop: 5,
				}}
				listItemLabelStyle={{
					color: Colors.secondaryFont,
					fontFamily: "Roboto-Regular",
					fontWeight: "400",
					fontSize: 14,
					opacity: 0.9,
				}}
				selectedItemLabelStyle={{
					color: Colors.secondaryFont,
					fontFamily: "Roboto-Medium",
					fontWeight: "500",
					fontSize: 14,
				}}
			/>
		</View>
	);
}
