import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	FlatList,
	Image,
	ScrollView,
	Keyboard,
	TouchableHighlight,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTemperatureHigh } from "@fortawesome/pro-light-svg-icons/faTemperatureHigh";
import { faRaindrops } from "@fortawesome/pro-light-svg-icons/faRaindrops";
import { faSun } from "@fortawesome/pro-light-svg-icons/faSun";
import { faMagnifyingGlass } from "@fortawesome/pro-light-svg-icons/faMagnifyingGlass";
import { faArrowRight } from "@fortawesome/pro-light-svg-icons/faArrowRight";
import { faAngleRight } from "@fortawesome/pro-light-svg-icons/faAngleRight";
import { LowSeasonDestinationListScreenProps } from "../../navigation/NavigationTypes";
import {
	AutoCompleteInput,
	Card,
	Container,
	FlatlistFooter,
	Header,
	NoResult,
	WhiteContainer,
} from "../../components";
import debounce from "lodash.debounce";
import Colors from "../../configs/Colors";
import Constant from "../../configs/Constant";
import ProductService from "../../services/ProductService";
import moment from "moment-timezone";
import { searchLowSeasonName } from "../../services/ApiService";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const allMonths: Array<any> = [
	{ label: "JANUARY", value: "JAN" },
	{ label: "FEBRUARY", value: "FEB" },
	{ label: "MARCH", value: "MAR" },
	{ label: "APRIL", value: "APR" },
	{ label: "MAY", value: "MAY" },
	{ label: "JUNE", value: "JUN" },
	{ label: "JULY", value: "JUL" },
	{ label: "AUGUST", value: "AUG" },
	{ label: "SEPTEMBER", value: "SEP" },
	{ label: "OCTOBER", value: "OCT" },
	{ label: "NOVEMBER", value: "NOV" },
	{ label: "DECEMBER", value: "DEC" },
];

const LowSeasonDestinationList: React.FC<
	LowSeasonDestinationListScreenProps
> = (props: LowSeasonDestinationListScreenProps): React.ReactElement => {
	const scrollRef = useRef<ScrollView>(null);

	const [selectedMonth, setSelectedMonth] = useState<string>(
		moment(new Date()).format("MMMM").toUpperCase()
	);
	const [lowSeasonList, setLowSeasonList] = useState<Array<any>>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [page, setPage] = useState<number>(1);
	const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
	const [isListEnd, setIsListEnd] = useState<boolean>(true);
	const [isRefresing, setIsRefreshing] = useState<boolean>(false);
	const [searchValue, setSearchValue] = useState<string>("");
	const [playing, setPlaying] = useState<boolean>(false);
	const [searchTxt, setSearchTxt] = useState<string>("");
	const [searchResults, setSearchResults] = useState<Array<any>>([]);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [isSearchResultHide, setIsSearchResultHide] = useState<boolean>(true);

	useEffect(() => {
		loadData(selectedMonth, 1);
		const index = allMonths.findIndex((month) => month.label === selectedMonth);
		if (index !== -1) {
			scrollTo(index);
		}
	}, []);

	const onSelectMonth = (item: any) => {
		setSelectedMonth(item.label);
		setIsLoading(true);
		loadData(item.label, 1);

		const index = allMonths.findIndex((month) => month.label === item.label);
		if (index !== -1) {
			scrollTo(index);
		}
	};

	const onRefresh = () => {
		setIsRefreshing(true);
		setIsLoading(true);
		loadData(selectedMonth, 1);
	};

	const onLoadMore = () => {
		setIsLoadMore(true);
		loadData(selectedMonth, page + 1);
	};

	const loadData = (month: any, pageNum: any) => {
		let reqBody = {
			page: pageNum,
			limit: Constant.DEFAULT_LIMIT,
			month: month,
		};

		ProductService.getLowSeasonDestinationMonthWise(reqBody)
			.then((response) => {
				const data: Array<any> = response.data;
				const allList: Array<any> =
					pageNum > 1 ? [...lowSeasonList, ...data] : [...data];
				setLowSeasonList(allList);
				setPage(pageNum);
				setIsListEnd(allList.length === Number(response.count));
				setIsLoading(false);
				setIsRefreshing(false);
				setIsLoadMore(false);
			})
			.catch((error) => {
				setIsListEnd(true);
				setIsLoading(false);
				setIsRefreshing(false);
				setIsLoadMore(false);
			});
	};

	const onChangeSearchText = (value: string) => {
		setSearchTxt(value);
		let trimValue: string = searchTxt.trim();

		if (trimValue.length > 0) {
			const searchMethod = debounce(() => {
				setIsSearching(true);
				searchLowSeasonName(searchTxt)
					.then((response) => {
						setSearchResults(response);
						setIsSearchResultHide(false);
						setIsSearching(false);
						// setSearchResults(response.data);
					})
					.catch((error) => {
						setIsSearching(false);
					});
			});
			searchMethod();
		} else {
			setSearchResults([]);
			setIsSearchResultHide(false);
			setIsSearchResultHide(true);
		}
	};

	const onClearSearchText = () => {
		Keyboard.dismiss();
		setSearchTxt("");
		setIsSearchResultHide(true);
		setIsLoading(true);
		loadData(selectedMonth, 1);
	};

	const renderResultList = (listProps: any) => (
		<View
			style={{
				height: "auto",
				maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.35),
				backgroundColor: Colors.white,
			}}
		>
			<FlatList
				data={listProps.data}
				renderItem={renderSearchItem}
				keyExtractor={autocompleteKeyExtractor}
				showsVerticalScrollIndicator={true}
				keyboardShouldPersistTaps="handled"
				persistentScrollbar={true}
			/>
		</View>
	);

	const onSelectName = (item: any, pageNum: number) => {
		Keyboard.dismiss();
		setSearchTxt(item.name);
		onSelectMonth({ label: item.month, value: item.month });
		setIsSearchResultHide(true);
		setIsLoading(true);

		let reqBody = {
			page: pageNum,
			limit: Constant.DEFAULT_LIMIT,
			month: item.month,
			name: item.name,
		};

		ProductService.getLowSeasonDestinationMonthWise(reqBody)
			.then((response) => {
				const data: Array<any> = response.data;
				const allList: Array<any> =
					pageNum > 1 ? [...lowSeasonList, ...data] : [...data];
				setLowSeasonList(allList);
				setPage(pageNum);
				setIsListEnd(allList.length === Number(response.count));
				setIsLoading(false);
				setIsRefreshing(false);
				setIsLoadMore(false);
			})
			.catch((error) => {
				setIsListEnd(true);
				setIsLoading(false);
				setIsRefreshing(false);
				setIsLoadMore(false);
			});
	};

	const renderSearchItem = ({ item }: any) => (
		<TouchableHighlight
			key={item.name}
			activeOpacity={0.5}
			underlayColor={Colors.rippleColor}
			onPress={() => onSelectName(item, 1)}
		>
			<View style={styles.listItem}>
				<Text style={styles.airportName}>{`${item.name}`}</Text>
			</View>
		</TouchableHighlight>
	);
	const autocompleteKeyExtractor = (item: any) => item.name;

	// const getLowDestinationList = () => {
	// 	let filterData = lowSeasonList?.filter((element) => {
	// 		let lowSeasonDestinationName = element.name.toLowerCase();
	// 		let search = searchValue.toLowerCase();
	// 		return lowSeasonDestinationName.includes(search);
	// 	});
	// 	return filterData;
	// };

	const scrollTo = (index: number) => {
		if (scrollRef.current) {
			const itemWidth = 90;
			const offset =
				index * itemWidth - (Constant.WINDOW_WIDTH / 2 - itemWidth / 2);
			scrollRef.current.scrollTo({ x: offset, animated: true });
		}
	};

	const goToLowSeasonDetails = (itemID: string, itemName: string) => {
		props.navigation.navigate("LowSeasonDestination", {
			productName: itemName,
			productId: itemID,
		});
	};

	const listEmptyComponent = () => (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<NoResult
				title={"No Results Found"}
				style={{ flex: 0.6 }}
				titleStyle={{ fontSize: 16 }}
			/>
		</View>
	);

	const getListFooterComponent = () => (
		<FlatlistFooter isListEnd={isListEnd} isLoadMore={isLoadMore} />
	);

	const keyExtractor = (item: any) => item._id;

	const renderItem = ({ item }: any) => {
		let url = typeof item.videoLink !== "undefined" ? item.videoLink : "";
		let startIndex = url.lastIndexOf("/") + 1;
		let endIndex = url.indexOf("?", startIndex);
		let videoId = url.substring(startIndex, endIndex);
		return (
			<Card style={styles.itemContainer}>
				<>
					<View style={styles.bannerImageBox}>
						{typeof item.videoLink !== "undefined" &&
						item.videoLink !== null ? (
							<YoutubePlayer
								width={Constant.WINDOW_WIDTH - 50}
								height={200}
								videoId={videoId}
							/>
						) : (
							<Image
								source={{ uri: item.banners[0] }}
								style={{
									height: "100%",
									width: "100%",
									borderRadius: 4,
								}}
								resizeMode="cover"
							/>
						)}
					</View>
					<TouchableOpacity
						activeOpacity={1}
						style={{ flexDirection: "row", justifyContent: "space-between" }}
						onPress={() => goToLowSeasonDetails(item._id, item.name)}
					>
						<>
							<View>
								<Text style={styles.headerText}>{item.name}</Text>
								{item.scope === "COUNTRY" ? (
									<Text style={[styles.locationText, { marginBottom: 10 }]}>
										{item.country.name}
									</Text>
								) : item.scope === "PROVINCE" ? (
									<Text
										style={[styles.locationText, { marginBottom: 10 }]}
									>{`${item.state.name}, ${item.country.name}`}</Text>
								) : item.scope === "CITY" ? (
									<Text
										style={[styles.locationText, { marginBottom: 10 }]}
									>{`${item.city.name}, ${item.state.name}, ${item.country.name}`}</Text>
								) : item.scope === "AIRPORT" ? (
									<Text
										style={[styles.locationText, { marginBottom: 10 }]}
									>{`${item.city.name}, ${item.state.name}, ${item.country.name}`}</Text>
								) : null}

								<View style={{ flexDirection: "row", alignItems: "center" }}>
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<FontAwesomeIcon
											icon={faTemperatureHigh}
											size={18}
											style={{ marginRight: 3 }}
											color={Colors.primaryBg}
										/>
										<Text
											style={[styles.descText, { marginLeft: 3 }]}
										>{`${item.lowSessionMonths.temprature}° C`}</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											marginLeft: 10,
										}}
									>
										<FontAwesomeIcon
											icon={faRaindrops}
											size={20}
											style={{ marginRight: 3 }}
											color={Colors.primaryBg}
										/>
										<Text
											style={[styles.descText, { marginLeft: 3 }]}
										>{`${item.lowSessionMonths.rainfall} mm`}</Text>
									</View>
									<View
										style={{
											flexDirection: "row",
											alignItems: "center",
											marginLeft: 10,
										}}
									>
										<FontAwesomeIcon
											icon={faSun}
											size={18}
											style={{ marginRight: 3 }}
											color={Colors.primaryBg}
										/>
										<Text
											style={[styles.descText, { marginLeft: 3 }]}
										>{`${item.lowSessionMonths.dayLight} Hr`}</Text>
									</View>
								</View>
							</View>
							<FontAwesomeIcon
								icon={faAngleRight}
								size={22}
								color={Colors.primaryBtn}
								style={{ alignSelf: "center" }}
							/>
						</>
					</TouchableOpacity>
				</>
			</Card>
		);
	};

	return (
		<Container>
			<Header title="Low Season Destination List" />
			<WhiteContainer style={{ paddingHorizontal: 15 }}>
				<View style={{ width: "100%" }}>
					<ScrollView
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						ref={scrollRef}
					>
						{allMonths.map((item: any, index: any) => {
							return (
								<TouchableOpacity
									activeOpacity={0.5}
									key={index}
									style={[
										styles.allMonthsBtn,
										selectedMonth === item.label
											? { backgroundColor: Colors.secondary }
											: {
													backgroundColor: Colors.white,
													borderWidth: 1,
													borderColor: Colors.mediumGrey,
											  },
									]}
									onPress={() => onSelectMonth(item)}
								>
									<Text
										style={[
											styles.allMonthsBtnText,
											selectedMonth === item.label
												? { color: Colors.white }
												: { color: Colors.lightFont },
										]}
									>
										{item.value}
									</Text>
								</TouchableOpacity>
							);
						})}
					</ScrollView>

					<View style={{ paddingHorizontal: 5, marginTop: 12 }}>
						<AutoCompleteInput
							label="Search"
							value={searchTxt}
							data={searchResults}
							onChangeText={onChangeSearchText}
							onClear={onClearSearchText}
							isSearching={isSearching}
							hideResults={isSearchResultHide}
							// error={
							// 	touched.airlineCode && errors.airlineCode
							// 		? errors.airlineCode
							// 		: null
							// }
							containerStyle={{ zIndex: 9 }}
							renderResultList={renderResultList}
						/>
					</View>
				</View>

				{isLoading ? (
					// <Loader />
					<>
						{[1, 2, 3].map((item) => (
							<View
								key={item.toString()}
								style={[
									styles.skeletonContainer,
									{
										width: Constant.WINDOW_WIDTH - 24,
										marginVertical: 10,
										marginHorizontal: 12,
									},
								]}
							>
								<SkeletonPlaceholder>
									<SkeletonPlaceholder.Item>
										<SkeletonPlaceholder.Item
											width={"100%"}
											height={180}
											borderRadius={3}
											marginBottom={15}
										/>
										<SkeletonPlaceholder.Item
											width={90}
											height={12}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={150}
											height={12}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={150}
											height={12}
											borderRadius={3}
											marginBottom={6}
										/>
										<SkeletonPlaceholder.Item
											width={90}
											height={12}
											borderRadius={3}
										/>
									</SkeletonPlaceholder.Item>
								</SkeletonPlaceholder>
							</View>
						))}
					</>
				) : (
					<FlatList
						data={lowSeasonList}
						renderItem={renderItem}
						showsVerticalScrollIndicator={false}
						keyExtractor={keyExtractor}
						refreshing={isRefresing}
						onRefresh={onRefresh}
						onEndReached={isListEnd ? undefined : onLoadMore}
						ListFooterComponent={getListFooterComponent}
						ListEmptyComponent={listEmptyComponent}
						keyboardShouldPersistTaps={"handled"}
						initialNumToRender={Constant.DEFAULT_LIMIT}
						style={{ marginTop: 15 }}
						contentContainerStyle={
							lowSeasonList.length <= 0 ? { flex: 1 } : null
						}
					/>
				)}
			</WhiteContainer>
		</Container>
	);
};

export default LowSeasonDestinationList;

const styles = StyleSheet.create({
	descText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 12,
		lineHeight: 18,
		color: Colors.secondaryFont,
		opacity: 0.8,
	},
	itemContainer: {
		padding: 10,
		borderRadius: 14,
		alignSelf: "center",
		marginHorizontal: 10,
		width: Constant.WINDOW_WIDTH - 34,
		marginVertical: 7,
		// paddingTop: 0,
	},
	bannerImageBox: {
		width: "100%",
		height: 200,
		alignItems: "center",
		justifyContent: "center",
		// backgroundColor: Colors.lightGrey,
		borderRadius: 10,
		marginRight: 10,
	},
	headerText: {
		fontSize: 14,
		fontFamily: "Roboto-Medium",
		fontWeight: "500",
		color: Colors.secondaryFont,
		// opacity: 0.8,
		lineHeight: 21,
		marginVertical: 5,
	},
	locationText: {
		fontSize: 13,
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		color: Colors.secondaryFont,
		// opacity: 0.8,
	},
	allMonthsBtn: {
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		height: 35,
		width: "auto",
		paddingHorizontal: 25,
		marginHorizontal: 4,
	},
	allMonthsBtnText: {
		fontFamily: "Roboto-Regular",
		fontWeight: "400",
		fontSize: 14,
	},
	searchBox: {
		height: 45,
		width: "100%",
		borderWidth: 1,
		borderRadius: 6,
		borderColor: Colors.lightBorder,
		marginTop: 15,
		paddingHorizontal: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	listItem: {
		paddingHorizontal: 10,
		paddingVertical: 15,
		borderWidth: 0,
		borderBottomWidth: 1,
		borderBottomColor: Colors.lightBorder,
		backgroundColor: Colors.white,
	},
	airportListContainer: {
		height: "auto",
		maxHeight: Math.floor(Constant.WINDOW_HEIGHT * 0.55),
	},
	airportName: {
		color: Colors.primaryFont,
		fontFamily: "Roboto-Regular",
		fontSize: 14,
		fontWeight: "400",
		opacity: 0.9,
	},
	skeletonContainer: {
		padding: 10,
		borderWidth: 1,
		borderColor: Colors.lightBorder,
		borderRadius: 10,
		width: "100%",
		alignSelf: "center",
	},
});
