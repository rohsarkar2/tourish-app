import React, { forwardRef, useImperativeHandle, Ref, useState } from "react";
import ImageView from "react-native-image-viewing";

type RefObject = {
	open: (url: string) => void;
};

const ImageViewer = forwardRef((props, ref: Ref<RefObject>) => {
	const [isVisible, toggleVisible] = useState<boolean>(false);
	const [images, setImages] = useState<Array<{ uri: string }>>([]);

	useImperativeHandle(ref, () => ({ open }));

	const open = (url: string): void => {
		setImages([{ uri: url }]);
		toggleVisible(true);
	};

	const close = (): void => {
		setImages([]);
		toggleVisible(false);
	};

	return !isVisible ? null : (
		<ImageView
			images={images}
			imageIndex={0}
			visible={isVisible}
			onRequestClose={close}
			presentationStyle="overFullScreen"
		/>
	);
});

export default ImageViewer;
