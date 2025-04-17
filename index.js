import "./gesture-handler";
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";
import messaging from "@react-native-firebase/messaging";
import notifee, { EventType } from "@notifee/react-native";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {});

notifee.onBackgroundEvent(async ({ type, detail }) => {
	switch (type) {
		case EventType.DISMISSED:
			break;
		case EventType.PRESS:
			break;
		default:
			break;
	}
});

AppRegistry.registerComponent(appName, () => App);
