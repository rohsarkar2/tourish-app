import React from "react";
import { StyleSheet, Image, ImageStyle } from "react-native";

type Props = {
	value: string;
	style?: ImageStyle | Array<ImageStyle>;
};

const styles = StyleSheet.create({
	img: {
		height: 150,
		width: 150,
	},
});

const QRCode: React.FC<Props> = (props) => (
	<Image
		source={{
			uri: `https://api.qrserver.com/v1/create-qr-code/?data=${props.value}`,
		}}
		style={[styles.img, props.style]}
		resizeMode="cover"
	/>
);

export default QRCode;
