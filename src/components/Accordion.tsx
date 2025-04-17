import React, { useState, PropsWithChildren } from "react";
import {
	StyleSheet,
	Text,
	View,
	TouchableHighlight,
	Platform,
	UIManager,
	LayoutAnimation,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronUp } from "@fortawesome/pro-light-svg-icons/faChevronUp";
import { faChevronDown } from "@fortawesome/pro-light-svg-icons/faChevronDown";
import Colors from "../configs/Colors";

if (Platform.OS === "android") {
	UIManager.setLayoutAnimationEnabledExperimental &&
		UIManager?.setLayoutAnimationEnabledExperimental(true);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	accordContainer: {
		paddingBottom: 4,
	},
	accordHeader: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: Colors.white,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 5,
		padding: 12,
	},
	accordTitle: {
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		fontSize: 13,
		color: Colors.primaryFont,
	},
	accordBody: {
		padding: 10,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: Colors.lightBorder,
		borderRadius: 0,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	textSmall: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		color: Colors.primaryFont,
	},
	seperator: {
		height: 12,
	},
});

type AccordionItemPros = PropsWithChildren<{
	title: string;
	expanded: boolean;
	onHeaderPress: () => void;
}>;

type AccordionProps = {
	data: Array<{ title: string; content: JSX.Element }>;
};

const AccordionItem: React.FC<AccordionItemPros> = (props) => (
	<View style={styles.accordContainer}>
		<TouchableHighlight
			onPress={props.onHeaderPress}
			underlayColor={Colors.lightGrey}
		>
			<View
				style={[
					styles.accordHeader,
					props.expanded
						? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
						: null,
				]}
			>
				<Text style={styles.accordTitle}>{props.title}</Text>
				<FontAwesomeIcon
					icon={props.expanded ? faChevronUp : faChevronDown}
					size={16}
					color={Colors.secondary}
				/>
			</View>
		</TouchableHighlight>
		{props.expanded && <View style={styles.accordBody}>{props.children}</View>}
	</View>
);

const Accordion: React.FC<AccordionProps> = (props) => {
	const [expandedIndex, setExpandedIndex] = useState<null | number>(null);

	const handleHeaderPress = (index: number) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setExpandedIndex(expandedIndex === index ? null : index);
	};

	return (
		<>
			{props.data.map((item, index) => (
				<AccordionItem
					key={`accordion-item-${index}`}
					title={item.title}
					expanded={expandedIndex === index}
					onHeaderPress={() => handleHeaderPress(index)}
				>
					{item.content}
				</AccordionItem>
			))}
		</>
	);
};

export default Accordion;
