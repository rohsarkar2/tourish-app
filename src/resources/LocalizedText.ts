import LocalizedStrings from "react-native-localization";
import Eenglish from "./languages/Eenglish";
import French from "./languages/French";
import German from "./languages/German";

const LocalizedText = new LocalizedStrings({
	fr: French,
	en: Eenglish,
	de: German,
});

export default LocalizedText;
