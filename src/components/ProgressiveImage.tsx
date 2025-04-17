import React, { useRef, useState } from "react";
import {
	StyleSheet,
	View,
	ViewStyle,
	Animated,
	ImageProps,
	LayoutChangeEvent,
	ImageStyle,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import Colors from "../configs/Colors";
import Constant from "../configs/Constant";

type Props = {
	source: ImageProps["source"];
	containerStyle?: ViewStyle;
	imageStyle?: ImageStyle;
};

const ProgressiveImage: React.FC<Props> = (props: Props) => {
	const imageAnimated = useRef(new Animated.Value(0)).current;
	const [imageSize, setImageSize] = useState<any>({
		width: Constant.WINDOW_WIDTH,
		height: 200,
	});
	const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

	const onImageLoad = () => {
		Animated.timing(imageAnimated, {
			toValue: 1,
			useNativeDriver: true,
		}).start(() => setIsImageLoaded(true));
	};

	const handleImageLayout = (event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setImageSize({ width, height });
	};

	return (
		<View
			style={[
				styles.container,
				props.containerStyle,
				{ width: imageSize.width, height: imageSize.height },
			]}
		>
			{!isImageLoaded && (
				<SkeletonPlaceholder
					backgroundColor={Colors.lightGrey}
					highlightColor={Colors.white}
				>
					<SkeletonPlaceholder.Item
						width={imageSize.width}
						height={imageSize.height}
					/>
				</SkeletonPlaceholder>
			)}
			<Animated.Image
				{...props}
				source={props.source}
				style={[
					styles.imageOverlay,
					{ opacity: imageAnimated },
					props.imageStyle,
				]}
				onLoad={onImageLoad}
				onLayout={handleImageLayout}
			/>
		</View>
	);
};

export default ProgressiveImage;

const styles = StyleSheet.create({
	imageOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		top: 0,
	},
	container: {
		backgroundColor: "#d1d1d1",
		justifyContent: "center",
		alignItems: "center",
	},
});
